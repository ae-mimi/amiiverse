const registeredInitializers = new WeakSet<() => void>();

export function initOnAstroPageLoad(initializer: () => void): void {
    initializer();

    if (registeredInitializers.has(initializer)) {
        return;
    }

    document.addEventListener("astro:page-load", initializer);
    registeredInitializers.add(initializer);
}
