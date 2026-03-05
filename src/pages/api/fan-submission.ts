export const prerender = false;

import type { APIRoute } from "astro";
import { getSanityWriteClient } from "../../lib/sanity/write.server";

export const POST: APIRoute = async ({ request, locals }) => {
    const data = await request.formData();
    const displayName = (data.get("displayName") as string)?.trim();
    const message = (data.get("message") as string)?.trim();
    const location = (data.get("location") as string)?.trim() || undefined;

    // Validation
    if (!displayName || !message) {
        return new Response(
            JSON.stringify({ message: "Name and message are required." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    if (message.length > 1000) {
        return new Response(
            JSON.stringify({ message: "Message must be under 1000 characters." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    try {
        const sanityClient = getSanityWriteClient({ locals });
        await sanityClient.create({
            _type: "fanSubmission",
            displayName,
            message,
            location,
            type: "message",
            status: "pending",
            submittedAt: new Date().toISOString(),
        });

        return new Response(
            JSON.stringify({ message: "Submitted for review." }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Fan submission error:", error);
        return new Response(
            JSON.stringify({ message: "Something went wrong. Please try again." }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
