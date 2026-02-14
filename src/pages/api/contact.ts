export const prerender = false;

import { sanityClient } from "sanity:client";

export async function POST({ request }: { request: Request }) {
    const data = await request.formData();
    const name = data.get("name") as string;
    const email = data.get("email") as string;
    const message = data.get("message") as string;
    const subject = (data.get("subject") as string) || "New Contact Form Submission";

    // Basic validation
    if (!name || !email || !message) {
        return new Response(
            JSON.stringify({
                message: "Missing required fields",
            }),
            { status: 400 }
        );
    }

    // Fetch Admin Email from CMS
    let adminEmail = "mgmt@amiiverse.com";
    try {
        // Query: Find the page that has a block named 'contact_section' and get its management_email
        // We look for any page that has a block with _name == 'contact_section'
        // and project that block's management_email
        const query = `*[_type == "page" && defined(blocks) && "contact_section" in blocks[].name][0].blocks[name == "contact_section"][0].management_email`;
        const fetchedEmail = await sanityClient.fetch(query);
        if (fetchedEmail) {
            adminEmail = fetchedEmail;
        }
    } catch (e) {
        console.warn("Could not fetch dynamic admin email, using default.", e);
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

    // 1. Save to Brevo CRM (Contacts)
    const contactPayload = {
        email: email,
        attributes: {
            FIRSTNAME: name,
        },
        updateEnabled: true,
    };

    // 2. Send Email via Brevo SMTP
    const emailPayload = {
        sender: {
            name: "amiiverse Website",
            email: "no-reply@amiiverse.com"
        },
        to: [
            {
                email: adminEmail,
                name: "amiiverse Admin"
            }
        ],
        subject: `[amiiverse Contact] ${subject}`,
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
            name: name
        }
    };

    try {
        // A. Save to CRM
        await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify(contactPayload)
        });

        // B. Send Admin Email
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify(emailPayload)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Brevo API Error:", errorData);
            return new Response(
                JSON.stringify({
                    message: "Failed to send email",
                    error: errorData
                }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({
                message: "Message sent successfully",
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
