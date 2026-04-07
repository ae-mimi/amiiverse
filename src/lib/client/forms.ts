function setFormState(
    statusEl: HTMLElement | null,
    state: "idle" | "success" | "warning" | "error",
    message: string,
): void {
    if (!statusEl) return;

    if (state === "idle") {
        statusEl.textContent = "";
        statusEl.setAttribute("hidden", "");
        statusEl.dataset.state = "";
        return;
    }

    statusEl.textContent = message;
    statusEl.dataset.state = state;
    statusEl.removeAttribute("hidden");
}

function setSubmitState(
    button: HTMLButtonElement | null,
    isSubmitting: boolean,
    pendingLabel = "Submitting...",
): void {
    if (!button) return;
    const original =
        button.dataset.originalText || button.textContent || "Submit";
    button.dataset.originalText = original;
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? pendingLabel : original;
}

function getScopedInput<T extends HTMLInputElement | HTMLTextAreaElement>(
    form: HTMLFormElement,
    selector: string,
): T | null {
    return form.querySelector(selector) as T | null;
}

async function parseJsonResponse(response: Response): Promise<Record<string, any>> {
    return await response.json().catch(() => ({}));
}

function attachBusinessContactForm(form: HTMLFormElement): void {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const statusEl = form.querySelector("[data-form-status]") as HTMLElement | null;
        const submitButton = form.querySelector(
            'button[type="submit"]',
        ) as HTMLButtonElement | null;

        const nameInput = getScopedInput<HTMLInputElement>(form, 'input[name="name"]');
        const emailInput = getScopedInput<HTMLInputElement>(form, 'input[name="email"]');
        const messageInput = getScopedInput<HTMLTextAreaElement>(
            form,
            'textarea[name="message"]',
        );
        if (!nameInput || !emailInput || !messageInput) return;

        setFormState(statusEl, "idle", "");
        setSubmitState(submitButton, true, "SENDING...");

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                body: new FormData(form),
            });
            const result = await parseJsonResponse(response);

            if (!response.ok) {
                throw new Error(result.message || "Unable to send message.");
            }

            setFormState(
                statusEl,
                "success",
                result.message || "Message sent successfully.",
            );

            const redirect = form.dataset.successRedirect || "/contact-success";
            window.setTimeout(() => {
                window.location.href = redirect;
            }, 900);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Network error. Please try again later.";
            setFormState(statusEl, "error", message);
            setSubmitState(submitButton, false);
        }
    });
}

function attachNewsletterForm(form: HTMLFormElement): void {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const statusEl = form.querySelector("[data-form-status]") as HTMLElement | null;
        const submitButton = form.querySelector(
            'button[type="submit"]',
        ) as HTMLButtonElement | null;
        const emailInput = getScopedInput<HTMLInputElement>(form, 'input[name="email"]');
        const consentInput = getScopedInput<HTMLInputElement>(
            form,
            'input[name="consent"]',
        );
        const nameInput = getScopedInput<HTMLInputElement>(form, 'input[name="name"]');
        const turnstileInput = getScopedInput<HTMLInputElement>(
            form,
            'input[name="cf-turnstile-response"]',
        );
        const redirect = form.dataset.successRedirect || "/newsletter-queue";

        if (!emailInput || !consentInput) return;

        setFormState(statusEl, "idle", "");

        try {
            if (!consentInput.checked) {
                throw new Error(
                    "Please consent to email updates before subscribing.",
                );
            }
            if (form.querySelector(".cf-turnstile") && !turnstileInput?.value) {
                throw new Error("Please complete the captcha.");
            }

            setSubmitState(submitButton, true, "...");

            const formData = new FormData();
            formData.append("email", emailInput.value);
            formData.append("consent", String(consentInput.checked));
            if (nameInput?.value) formData.append("name", nameInput.value);
            if (turnstileInput?.value) {
                formData.append("turnstileToken", turnstileInput.value);
            }

            const params = new URLSearchParams(window.location.search);
            const source =
                params.get("source") ||
                (window.location.hash === "#join-the-queue" ? "queue" : "");
            if (source) formData.append("source", source);

            const response = await fetch("/api/subscribe", {
                method: "POST",
                body: formData,
            });
            const result = await parseJsonResponse(response);

            if (!response.ok) {
                throw new Error(result.message || "Subscription failed.");
            }

            window.setTimeout(() => {
                window.location.href = redirect;
            }, 150);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Network error. Please try again.";
            setFormState(statusEl, "error", message);
            setSubmitState(submitButton, false);
        }
    });
}

export function initBusinessContactForms(): void {
    if (typeof document === "undefined") return;
    const forms = document.querySelectorAll(
        'form[data-form-kind="business-contact"]',
    );
    forms.forEach((form) => attachBusinessContactForm(form as HTMLFormElement));
}

export function initNewsletterForms(): void {
    if (typeof document === "undefined") return;
    const forms = document.querySelectorAll('form[data-form-kind="newsletter"]');
    forms.forEach((form) => attachNewsletterForm(form as HTMLFormElement));
}
