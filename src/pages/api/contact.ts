export const prerender = false;

export async function POST({ request }) {
    const data = await request.formData();
    const name = data.get("name");
    const email = data.get("email");
    const message = data.get("message");
    const subject = data.get("subject") || "New Contact Form Submission";

    // Basic validation
    if (!name || !email || !message) {
        return new Response(
            JSON.stringify({
                message: "Missing required fields",
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

    const payload = {
        sender: {
            name: "Amiiverse Website",
            email: "no-reply@amiiverse.com"
        },
        to: [
            {
                email: "mgmt@amiiverse.com", // Replace with your actual admin email in production if different
                name: "Amiiverse Admin"
            }
        ],
        subject: `[Amiiverse Contact] ${subject}`,
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
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
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
            console.error("Brevo API Error:", errorData);
            return new Response(
                JSON.stringify({
                    message: "Failed to send email",
                    error: errorData
                }),
                { status: 500 }
            );
        }

        // Optional: Send auto-reply to user (could be a separate call here)

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
