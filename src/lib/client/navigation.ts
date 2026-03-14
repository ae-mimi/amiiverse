let headerBound = false;

export function initSiteHeader(): void {
    if (typeof document === "undefined" || headerBound) return;
    headerBound = true;

    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu-overlay");
    const iconMenu = document.querySelector(".icon-menu");
    const iconClose = document.querySelector(".icon-close");
    const header = document.querySelector(".site-header") as HTMLElement | null;

    let isMenuOpen = false;
    let lastScrollY = window.scrollY;
    let isHeaderHidden = false;

    const updateHeaderHeight = () => {
        if (!header) return;
        document.documentElement.style.setProperty(
            "--header-height",
            `${header.offsetHeight}px`,
        );
    };

    const closeMenu = () => {
        if (!mobileMenu || !menuToggle) return;
        mobileMenu.classList.remove("is-open");
        mobileMenu.setAttribute("aria-hidden", "true");
        mobileMenu.setAttribute("inert", "");
        document.body.style.overflow = "";
        isMenuOpen = false;
        menuToggle.setAttribute("aria-label", "Open Menu");
        menuToggle.setAttribute("aria-expanded", "false");
        iconMenu?.classList.remove("is-hidden");
        iconClose?.classList.add("is-hidden");
    };

    const openMenu = () => {
        if (!mobileMenu || !menuToggle) return;
        mobileMenu.classList.add("is-open");
        mobileMenu.removeAttribute("inert");
        mobileMenu.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        isMenuOpen = true;
        menuToggle.setAttribute("aria-label", "Close Menu");
        menuToggle.setAttribute("aria-expanded", "true");
        iconMenu?.classList.add("is-hidden");
        iconClose?.classList.remove("is-hidden");
    };

    menuToggle?.addEventListener("click", () => {
        if (isMenuOpen) closeMenu();
        else openMenu();
    });

    mobileMenu?.addEventListener("click", (event) => {
        if (event.target === mobileMenu) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMenuOpen) {
            closeMenu();
        }
    });

    if (header) {
        window.addEventListener(
            "scroll",
            () => {
                const currentScrollY = window.scrollY;
                if (currentScrollY < lastScrollY || currentScrollY < 50) {
                    if (isHeaderHidden) {
                        header.classList.remove("is-hidden");
                        isHeaderHidden = false;
                    }
                } else if (
                    currentScrollY > lastScrollY &&
                    currentScrollY > 100 &&
                    !isMenuOpen
                ) {
                    if (!isHeaderHidden) {
                        header.classList.add("is-hidden");
                        isHeaderHidden = true;
                    }
                }
                lastScrollY = currentScrollY;
            },
            { passive: true },
        );

        updateHeaderHeight();
        const resizeObserver = new ResizeObserver(updateHeaderHeight);
        resizeObserver.observe(header);
    }
}
