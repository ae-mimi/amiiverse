export const prerender = false;

import type { APIRoute } from "astro";
import { getSanityWriteClient } from "../../lib/sanity/write.server";

// Simple in-memory rate limiter: 1 vote per IP per poll per 60 seconds
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000;

export const POST: APIRoute = async ({ request, locals }) => {
    let body: { pollSlug?: string; optionIndex?: number };

    try {
        body = await request.json();
    } catch {
        return new Response(
            JSON.stringify({ message: "Invalid request body." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { pollSlug, optionIndex } = body;

    if (!pollSlug || typeof optionIndex !== "number" || optionIndex < 0) {
        return new Response(
            JSON.stringify({ message: "Missing pollSlug or valid optionIndex." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // Basic server-side rate limit
    const clientIP =
        request.headers.get("cf-connecting-ip") ||
        request.headers.get("x-forwarded-for") ||
        "unknown";
    const rateLimitKey = `${clientIP}:${pollSlug}`;
    const lastVote = rateLimitMap.get(rateLimitKey);

    if (lastVote && Date.now() - lastVote < RATE_LIMIT_MS) {
        return new Response(
            JSON.stringify({ message: "You've already voted recently. Please wait." }),
            { status: 429, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const sanityClient = getSanityWriteClient({ locals });
        // Fetch the poll document
        const poll = await sanityClient.fetch(
            `*[_type == "poll" && slug.current == $slug][0]{ _id, options, voteCounts, status }`,
            { slug: pollSlug }
        );

        if (!poll) {
            return new Response(
                JSON.stringify({ message: "Poll not found." }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        if (poll.status === "closed") {
            return new Response(
                JSON.stringify({ message: "This poll is closed." }),
                { status: 403, headers: { "Content-Type": "application/json" } }
            );
        }

        if (optionIndex >= (poll.options?.length || 0)) {
            return new Response(
                JSON.stringify({ message: "Invalid option index." }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Initialise voteCounts if missing
        const currentCounts: number[] = poll.voteCounts || new Array(poll.options.length).fill(0);
        currentCounts[optionIndex] = (currentCounts[optionIndex] || 0) + 1;

        // Patch the poll document
        await sanityClient.patch(poll._id).set({ voteCounts: currentCounts }).commit();

        // Mark rate-limit
        rateLimitMap.set(rateLimitKey, Date.now());

        // Return updated counts
        const totalVotes = currentCounts.reduce((a, b) => a + b, 0);

        return new Response(
            JSON.stringify({
                message: "Vote recorded!",
                voteCounts: currentCounts,
                totalVotes,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Poll vote error:", error);
        return new Response(
            JSON.stringify({ message: "Something went wrong." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
