import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    const data = await request.formData();
    const email = data.get("email");

    // Basic validation
    if (!email) {
        return new Response(
            JSON.stringify({
                message: "Email is missing",
            }),
            { status: 400 }
        );
    }

    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
        console.error("BREVO_API_KEY is not set");
        return new Response(
            JSON.stringify({
                message: "Server configuration error",
            }),
            { status: 500 }
        );
    }

    // 1. Create or Update Contact in Brevo
    const payload = {
        email: email,
        updateEnabled: true,
        // listIds: [2], // UNCOMMENT and replace with your actual List ID from Brevo
    };

    try {
        const response = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json();

            // Handle "Contact already exists" gracefully if strictly creating
            if (errorData.code === 'duplicate_parameter') {
                return new Response(
                    JSON.stringify({
                        message: "You are already subscribed!",
                    }),
                    { status: 200 } // Treat as success for UX
                );
            }

            console.error("Brevo API Error:", errorData);
            return new Response(
                JSON.stringify({
                    message: "Failed to subscribe",
                    error: errorData
                }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({
                message: "Subscribed successfully",
            }),
            { status: 200 }
        );

    } catch (error) {
        console.error("Fetch Error:", error);
        return new Response(
            JSON.stringify({
                message: "Network error occurred",
            }),
            { status: 500 }
        );
    }
}
