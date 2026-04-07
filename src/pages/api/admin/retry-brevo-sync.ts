import type { APIRoute } from "astro";
import {
    getCloudflareRuntimeEnv,
    getServerEnvValue,
} from "../../../lib/server/cloudflareRuntimeEnv";

export const prerender = false;

interface D1PreparedStatementLike {
    bind: (...values: unknown[]) => D1PreparedStatementLike;
    all: () => Promise<{ results?: Array<Record<string, unknown>> }>;
    first: () => Promise<Record<string, unknown> | null>;
    run: () => Promise<Record<string, unknown>>;
}

interface D1DatabaseLike {
    prepare: (query: string) => D1PreparedStatementLike;
}

type BrevoStatus = "pending" | "synced" | "failed";

function jsonResponse(status: number, body: Record<string, unknown>): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function isAuthorized(request: Request, adminToken: string): boolean {
    const candidate = request.headers.get("x-admin-token") || "";
    return Boolean(adminToken && candidate && candidate === adminToken);
}

async function syncToBrevo(
    apiKey: string,
    listIdRaw: string,
    doiTemplateIdRaw: string,
    doiRedirectUrl: string,
    email: string,
): Promise<{ status: BrevoStatus; lastError: string }> {
    const listId = Number(listIdRaw);
    const templateId = Number(doiTemplateIdRaw);

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
                }),
            },
        );
        if (response.ok) {
            return { status: "synced", lastError: "" };
        }
        const errorText = (await response.text()).slice(0, 500);
        console.error("Brevo DOI retry failed", {
            email,
            endpoint: "doubleOptinConfirmation",
            status: response.status,
            statusText: response.statusText,
            error: errorText,
        });
        return { status: "failed", lastError: errorText };
    }

    const payload: Record<string, unknown> = {
        email,
        updateEnabled: true,
    };
    if (Number.isFinite(listId)) {
        payload.listIds = [listId];
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
        return { status: "synced", lastError: "" };
    }
    const errorText = await response.text();
    if (errorText.includes("duplicate_parameter")) {
        return { status: "synced", lastError: "" };
    }
    console.error("Brevo contact retry failed", {
        email,
        endpoint: "contacts",
        status: response.status,
        statusText: response.statusText,
        error: errorText.slice(0, 500),
    });
    return { status: "failed", lastError: errorText.slice(0, 500) };
}

export const GET: APIRoute = async ({ request, locals }) => {
    const adminToken = getServerEnvValue({ locals }, "ADMIN_SYNC_TOKEN");
    if (!isAuthorized(request, adminToken)) {
        return jsonResponse(401, { message: "Unauthorized" });
    }

    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;
    if (!db) {
        return jsonResponse(500, { message: "Missing D1 binding `DB`" });
    }

    const statsRow = await db
        .prepare(
            `SELECT
                COUNT(*) AS total,
                SUM(CASE WHEN brevo_status = 'pending' THEN 1 ELSE 0 END) AS pending,
                SUM(CASE WHEN brevo_status = 'synced' THEN 1 ELSE 0 END) AS synced,
                SUM(CASE WHEN brevo_status = 'failed' THEN 1 ELSE 0 END) AS failed
             FROM fan_leads`,
        )
        .first();

    return jsonResponse(200, {
        total: Number(statsRow?.total || 0),
        pending: Number(statsRow?.pending || 0),
        synced: Number(statsRow?.synced || 0),
        failed: Number(statsRow?.failed || 0),
    });
};

export const POST: APIRoute = async ({ request, locals }) => {
    const adminToken = getServerEnvValue({ locals }, "ADMIN_SYNC_TOKEN");
    if (!isAuthorized(request, adminToken)) {
        return jsonResponse(401, { message: "Unauthorized" });
    }

    const runtimeEnv = getCloudflareRuntimeEnv({ locals });
    const db = runtimeEnv.DB as D1DatabaseLike | undefined;
    if (!db) {
        return jsonResponse(500, { message: "Missing D1 binding `DB`" });
    }

    const BREVO_API_KEY = getServerEnvValue({ locals }, "BREVO_API_KEY");
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
    if (!BREVO_API_KEY) {
        return jsonResponse(500, { message: "Missing BREVO_API_KEY" });
    }

    const requestBody = await request
        .json()
        .catch(() => ({} as Record<string, unknown>));
    const limit = Math.max(
        1,
        Math.min(200, Number(requestBody?.limit || 50) || 50),
    );

    const rows = await db
        .prepare(
            `SELECT email
             FROM fan_leads
             WHERE brevo_status IN ('pending', 'failed')
             ORDER BY created_at ASC
             LIMIT ?`,
        )
        .bind(limit)
        .all();

    let synced = 0;
    let failed = 0;

    for (const row of rows.results || []) {
        const email = String(row.email || "").trim();
        if (!email) continue;

        const result = await syncToBrevo(
            BREVO_API_KEY,
            BREVO_LIST_ID,
            BREVO_DOUBLE_OPT_IN_TEMPLATE_ID,
            BREVO_DOUBLE_OPT_IN_REDIRECT,
            email,
        );

        await db
            .prepare(
                `UPDATE fan_leads
                 SET brevo_status = ?,
                     last_error = ?,
                     last_synced_at = CASE WHEN ? = 'synced' THEN ? ELSE last_synced_at END,
                     updated_at = ?,
                     attempt_count = attempt_count + 1
                 WHERE email = ?`,
            )
            .bind(
                result.status,
                result.lastError,
                result.status,
                new Date().toISOString(),
                new Date().toISOString(),
                email,
            )
            .run();

        if (result.status === "synced") {
            synced += 1;
        } else {
            failed += 1;
        }
    }

    return jsonResponse(200, {
        processed: Number((rows.results || []).length),
        synced,
        failed,
    });
};
