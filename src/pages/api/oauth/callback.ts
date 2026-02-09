export const prerender = false;

export async function GET({ request }) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    const client_id = import.meta.env.GITHUB_CLIENT_ID;
    const client_secret = import.meta.env.GITHUB_CLIENT_SECRET;

    if (!code) {
        return new Response("No code provided", { status: 400 });
    }

    if (!client_id || !client_secret) {
        return new Response("GitHub credentials not configured", { status: 500 });
    }

    try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id,
                client_secret,
                code,
            }),
        });

        const data = await response.json();
        const token = data.access_token;

        if (!token) {
            return new Response(JSON.stringify(data), { status: 400 });
        }

        // Return HTML that posts the message back to the CMS window
        const html = `
      <!DOCTYPE html>
      <html>
      <body>
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            
            // Validate origin if needed, but for now we trust the opener
             window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({
            token: token,
            provider: "github"
        })}', 
              e.origin
            );
          }

          window.addEventListener("message", receiveMessage, false);
          
          // Send message to opener to initiate handshake
          window.opener.postMessage("authorizing:github", "*");
        })()
      </script>
      </body>
      </html>
    `;

        return new Response(html, {
            headers: { "Content-Type": "text/html" },
        });

    } catch (error) {
        return new Response(error.message, { status: 500 });
    }
}
