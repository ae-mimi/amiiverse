export const prerender = false;

import type { APIRoute } from "astro";
import { sanityClient } from "sanity:client";
import { getServerEnvValue } from "../../lib/server/cloudflareRuntimeEnv";

export const POST: APIRoute = async ({ request, locals }) => {
    const data = await request.formData();
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const message = data.get("message") as string;
    const subject =
        (data.get("subject") as string) || "New Contact Form Submission";

    // Basic validation
    if (!name || !email || !message) {
        return new Response(
            JSON.stringify({
                message: "Missing required fields",
            }),
            { status: 400 },
        );
    }

    // Fetch admin email from CMS.
    let adminEmail = "mgmt@weareamii.com";
    try {
        const query = `*[_type == "page" && defined(blocks) && "contact_section" in blocks[].name][0].blocks[name == "contact_section"][0].management_email`;
        const fetchedEmail = await sanityClient.fetch(query);
        if (fetchedEmail) {
            adminEmail = fetchedEmail;
        }
    } catch (e) {
        console.warn("Could not fetch dynamic admin email, using default.", e);
    }

    const BREVO_API_KEY = getServerEnvValue({ locals }, "BREVO_API_KEY");

    if (!BREVO_API_KEY) {
        console.error("BREVO_API_KEY is not set");
        return new Response(
            JSON.stringify({
                message: "Server configuration error",
            }),
            { status: 500 },
        );
    }

    const rawContactListId =
        getServerEnvValue({ locals }, "BREVO_CONTACT_LIST_ID") ||
        getServerEnvValue({ locals }, "BREVO_LIST_ID");
    const parsedContactListId = Number(rawContactListId);
    const contactPayload: Record<string, unknown> = {
        email,
        attributes: {
            FIRSTNAME: name,
        },
        updateEnabled: true,
    };
    if (Number.isFinite(parsedContactListId)) {
        contactPayload.listIds = [parsedContactListId];
    }

    const emailPayload = {
        sender: {
            name: "amii Website",
            email: "no-reply@weareamii.com",
        },
        to: [
            {
                email: adminEmail,
                name: "amii Admin",
            },
        ],
        subject: `[amii Contact] ${subject}`,
        htmlContent: `
          <html>
              <body>
                  <h1>New Contact Message</h1>
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Subject:</strong> ${subject}</p>
                  <br/>
                  <p><strong>Message:</strong></p>
                  <p>${message}</p>
              </body>
          </html>
      `,
        replyTo: {
            email: email,
            name: name,
        },
    };

    try {
        const contactResponse = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                accept: "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify(contactPayload),
        });

        if (!contactResponse.ok) {
            const contactError = await contactResponse.text();
            if (!contactError.includes("duplicate_parameter")) {
                console.error("Brevo contact sync failed:", contactError);
                return new Response(
                    JSON.stringify({
                        message: "Failed to save contact",
                    }),
                    { status: 500 },
                );
            }
        }

        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                accept: "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json",
            },
            body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Brevo SMTP error:", errorData);
            return new Response(
                JSON.stringify({
                    message: "Failed to send email",
                }),
                { status: 500 },
            );
        }

        return new Response(
            JSON.stringify({
                message: "Message sent successfully",
            }),
            { status: 200 },
        );
    } catch (error) {
        console.error("Fetch Error:", error);
        return new Response(
            JSON.stringify({
                message: "Network error occurred",
            }),
            { status: 500 },
        );
    }
};
