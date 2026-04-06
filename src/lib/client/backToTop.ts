let backToTopBound = false;

export function initBackToTop(): void {
    if (typeof document === "undefined" || backToTopBound) return;
    const button = document.querySelector("[data-back-to-top]") as HTMLButtonElement | null;
    if (!button) return;

    backToTopBound = true;

    const syncVisibility = () => {
        const shouldShow = window.scrollY > 420;
        button.hidden = false;
        button.classList.toggle("isVisible", shouldShow);
    };

    button.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });
}
