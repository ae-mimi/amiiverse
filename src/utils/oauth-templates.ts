export function getOAuthSuccessHtml(token: string) {
    return `
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
        provider: "github",
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
}
