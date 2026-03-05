import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../lib/server/cloudflareRuntimeEnv";
import {
    getClientIp,
    makeEmailRateKey,
    makeIpRateKey,
    normalizeEmail,
    normalizeName,
    normalizeSource,
    parseConsent,
    validateSubscribeInput,
} from "../../lib/server/subscribeFlow";

export const prerender = false;

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    first: () => Promise<Record<string, unknown> | null>;
    run: () => Promise<Record<string, unknown>>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

interface KVNamespaceLike {
    get: (key: string) => Promise<string | null>;
    put: (
        key: string,
        value: string,
        options?: { expirationTtl?: number },
    ) => Promise<void>;
}

type BrevoStatus = "pending" | "synced" | "failed";

function jsonResponse(status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function applyLimit(
    cache: KVNamespaceLike | undefined,
    key: string,
    max: number,
    ttlSeconds: number,
): Promise<boolean> {
    if (!cache) return false;
    const current = Number(await cache.get(key) || "0");
    if (Number.isFinite(current) && current >= max) return true;
    await cache.put(key, String(Math.max(0, current) + 1), {
        expirationTtl: ttlSeconds,
    });
    return false;
}

async function verifyTurnstileToken(
    turnstileSecret: string,
    token: string,
    remoteIp: string,
): Promise<boolean> {
    const body = new URLSearchParams();
    body.set("secret", turnstileSecret);
    body.set("response", token);
    if (remoteIp) {
        body.set("remoteip", remoteIp);
    }

    const response = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        },
    );

    if (!response.ok) return false;
    const result = await response.json();
    return Boolean(result?.success);
}

async function updateLeadStatus(
    db: D1DatabaseLike,
    email: string,
    status: BrevoStatus,
    contactId: string,
    lastError: string,
): Promise<void> {
    await db
        .prepare(
            `UPDATE fan_leads
             SET brevo_status = ?,
                 brevo_contact_id = ?,
                 last_error = ?,
                 last_synced_at = CASE WHEN ? = 'synced' THEN ? ELSE last_synced_at END,
                 updated_at = ?,
                 attempt_count = attempt_count + 1
             WHERE email = ?`,
        )
        .bind(
            status,
            contactId,
            lastError,
            status,
            new Date().toISOString(),
            new Date().toISOString(),
            email,
        )
        .run();
}

async function syncToBrevo(
    apiKey: string,
    listIdRaw: string,
    doiTemplateIdRaw: string,
    doiRedirectUrl: string,
    email: string,
    name: string,
): Promise<{
    status: BrevoStatus;
    contactId: string;
    lastError: string;
}> {
    const listId = Number(listIdRaw);
    const templateId = Number(doiTemplateIdRaw);
    const attrs = name ? { FIRSTNAME: name } : undefined;

    if (
        Number.isFinite(listId) &&
        Number.isFinite(templateId) &&
        doiRedirectUrl
    ) {
        const response = await fetch(
            "https://api.brevo.com/v3/contacts/doubleOptinConfirmation",
            {
                method: "POST",
                headers: {
                    accept: "application/json",
                    "api-key": apiKey,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    includeListIds: [listId],
                    templateId,
                    redirectionUrl: doiRedirectUrl,
                    attributes: attrs,
                }),
            },
        );

        if (response.ok) {
            return { status: "synced", contactId: "", lastError: "" };
        }
        const err = await response.text();
        return {
            status: "failed",
            contactId: "",
            lastError: err.slice(0, 500),
        };
    }

    const payload: Record<string, unknown> = {
        email,
        updateEnabled: true,
    };
    if (Number.isFinite(listId)) {
        payload.listIds = [listId];
    }
    if (attrs) {
        payload.attributes = attrs;
    }

    const response = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
            accept: "application/json",
            "api-key": apiKey,
            "content-type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (response.ok) {
        let contactId = "";
        try {
            const result = await response.json();
            contactId = String(result?.id ?? "");
        } catch {
            contactId = "";
        }
        return { status: "synced", contactId, lastError: "" };
    }

    const errText = await response.text();
    if (errText.includes("duplicate_parameter")) {
        return { status: "synced", contactId: "", lastError: "" };
    }
    return {
        status: "failed",
        contactId: "",
        lastError: errText.slice(0, 500),
    };
}

export const POST: APIRoute = async ({ request, locals }) => {
    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;
    if (!db) {
        return jsonResponse(500, { message: "Missing D1 binding `DB`" });
    }

    const data = request.headers.get("content-type")?.includes("application/json")
        ? await request.json().catch(() => ({} as Record<string, unknown>))
        : await request.formData();

    const email = normalizeEmail(
        data instanceof FormData ? data.get("email") : data?.email,
    );
    const source = normalizeSource(
        data instanceof FormData ? data.get("source") : data?.source,
    );
    const name = normalizeName(
        data instanceof FormData ? data.get("name") : data?.name,
    );
    const consent = parseConsent(
        data instanceof FormData ? data.get("consent") : data?.consent,
    );
    const turnstileToken = String(
        (data instanceof FormData
            ? data.get("turnstileToken") || data.get("cf-turnstile-response")
            : data?.turnstileToken || data?.["cf-turnstile-response"]) ?? "",
    ).trim();

    const validationError = validateSubscribeInput({
        email,
        consent,
        source,
        turnstileToken,
        name,
    });
    if (validationError) {
        return jsonResponse(400, { message: validationError });
    }

    const turnstileSecret = getServerEnvValue({ locals }, "TURNSTILE_SECRET_KEY");
    if (!turnstileSecret) {
        return jsonResponse(500, {
            message: "Server configuration error: TURNSTILE_SECRET_KEY missing.",
        });
    }

    const clientIp = getClientIp(request.headers);
    const turnstileValid = await verifyTurnstileToken(
        turnstileSecret,
        turnstileToken,
        clientIp,
    );
    if (!turnstileValid) {
        return jsonResponse(400, {
            message: "Captcha verification failed. Please try again.",
        });
    }

    const cache = runtimeEnv.CACHE as KVNamespaceLike | undefined;
    const emailRateLimited = await applyLimit(
        cache,
        makeEmailRateKey(email),
        4,
        60 * 60,
    );
    if (emailRateLimited) {
        return jsonResponse(429, {
            message: "Too many subscribe attempts for this email.",
        });
    }
    const ipRateLimited = await applyLimit(
        cache,
        makeIpRateKey(clientIp),
        20,
        60 * 60,
    );
    if (ipRateLimited) {
        return jsonResponse(429, {
            message: "Too many subscribe attempts. Please try later.",
        });
    }

    const nowIso = new Date().toISOString();
    const existingLead = await db
        .prepare(
            `SELECT email, brevo_status
             FROM fan_leads
             WHERE email = ?
             LIMIT 1`,
        )
        .bind(email)
        .first();

    if (!existingLead) {
        await db
            .prepare(
                `INSERT INTO fan_leads (
                    id,
                    email,
                    consent,
                    source,
                    created_at,
                    updated_at,
                    brevo_status,
                    attempt_count
                ) VALUES (?, ?, 1, ?, ?, ?, 'pending', 0)`,
            )
            .bind(`lead_${crypto.randomUUID()}`, email, source, nowIso, nowIso)
            .run();
    } else {
        await db
            .prepare(
                `UPDATE fan_leads
                 SET consent = 1,
                     source = CASE WHEN ? != '' THEN ? ELSE source END,
                     updated_at = ?
                 WHERE email = ?`,
            )
            .bind(source, source, nowIso, email)
            .run();
    }

    const BREVO_API_KEY = getServerEnvValue({ locals }, "BREVO_API_KEY");
    if (!BREVO_API_KEY) {
        return jsonResponse(202, {
            status: "queued",
            message: "Saved locally. Email sync is pending.",
        });
    }

    const BREVO_LIST_ID =
        getServerEnvValue({ locals }, "BREVO_NEWSLETTER_LIST_ID") ||
        getServerEnvValue({ locals }, "BREVO_LIST_ID");
    const BREVO_DOUBLE_OPT_IN_TEMPLATE_ID = getServerEnvValue(
        { locals },
        "BREVO_DOUBLE_OPT_IN_TEMPLATE_ID",
    );
    const BREVO_DOUBLE_OPT_IN_REDIRECT = getServerEnvValue(
        { locals },
        "BREVO_DOUBLE_OPT_IN_REDIRECT",
    );

    try {
        const brevo = await syncToBrevo(
            BREVO_API_KEY,
            BREVO_LIST_ID,
            BREVO_DOUBLE_OPT_IN_TEMPLATE_ID,
            BREVO_DOUBLE_OPT_IN_REDIRECT,
            email,
            name,
        );

        await updateLeadStatus(
            db,
            email,
            brevo.status,
            brevo.contactId,
            brevo.lastError,
        );

        if (brevo.status === "failed") {
            return jsonResponse(202, {
                status: "queued",
                message: "Saved locally. Confirmation sync will retry.",
            });
        }

        const responseStatus = existingLead ? "duplicate" : "accepted";
        return jsonResponse(200, {
            status: responseStatus,
            message:
                responseStatus === "duplicate"
                    ? "Already in our fan list."
                    : "Check your email to confirm subscription.",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unexpected error";
        await updateLeadStatus(db, email, "failed", "", message.slice(0, 500));
        return jsonResponse(202, {
            status: "queued",
            message: "Saved locally. Confirmation sync will retry.",
        });
    }
};
