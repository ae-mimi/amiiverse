/**
 * Date and duration formatting utilities.
 */

/** Format a date string to "Jan 15, 2026" format */
export function formatDate(dateStr: string | undefined): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/** Format a date string to "January 15, 2026" format */
export function formatDateLong(dateStr: string | undefined): string {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/** Format a datetime string to "Jan 15, 2026 · 8:00 PM" */
export function formatDateTime(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const datePart = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return `${datePart} · ${timePart}`;
}

/** Format "3:45" duration or return as-is */
export function formatDuration(duration: string | undefined): string {
    return duration || "";
}

/** Get relative time description (e.g. "in 3 days", "2 months ago") */
export function relativeTime(dateStr: string | undefined): string {
    if (!dateStr) return "";
    const now = Date.now();
    const target = new Date(dateStr).getTime();
    const diff = target - now;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const past = diff < 0;

    if (days === 0) return past ? "today" : "today";
    if (days === 1) return past ? "yesterday" : "tomorrow";
    if (days < 30) return past ? `${days} days ago` : `in ${days} days`;
    const months = Math.floor(days / 30);
    if (months < 12) return past ? `${months}mo ago` : `in ${months}mo`;
    const years = Math.floor(months / 12);
    return past ? `${years}y ago` : `in ${years}y`;
}
