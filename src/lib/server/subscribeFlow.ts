export interface SubscribeInput {
    email: string;
    consent: boolean;
    source: string;
    turnstileToken: string;
    name: string;
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string {
    return String(value ?? "").trim().toLowerCase();
}

export function normalizeSource(value: unknown): string {
    return String(value ?? "").trim().slice(0, 80);
}

export function normalizeName(value: unknown): string {
    return String(value ?? "").trim().slice(0, 120);
}

export function parseConsent(value: unknown): boolean {
    const normalized = String(value ?? "").trim().toLowerCase();
    return (
        normalized === "true" ||
        normalized === "1" ||
        normalized === "yes" ||
        normalized === "on"
    );
}

export function isValidEmail(value: string): boolean {
    return EMAIL_REGEX.test(value);
}

export function validateSubscribeInput(input: SubscribeInput): string | null {
    if (!input.email || !isValidEmail(input.email)) {
        return "Please enter a valid email address.";
    }
    if (!input.consent) {
        return "Consent is required before subscribing.";
    }
    if (!input.turnstileToken) {
        return "Captcha verification is required.";
    }
    return null;
}

export function makeEmailRateKey(email: string): string {
    return `rl:subscribe:email:${encodeURIComponent(email)}`;
}

export function makeIpRateKey(ip: string): string {
    return `rl:subscribe:ip:${ip || "unknown"}`;
}

export function getClientIp(headers: Headers): string {
    const cfIp = headers.get("cf-connecting-ip");
    if (cfIp) return cfIp.trim();

    const forwardedFor = headers.get("x-forwarded-for");
    if (!forwardedFor) return "";
    const first = forwardedFor.split(",")[0];
    return String(first || "").trim();
}

