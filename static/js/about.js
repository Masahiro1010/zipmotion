(function () {
    window.initAboutPage = function (container) {
        if (!container) {
            return;
        }

        if (container.dataset.aboutBound === "1") {
            return;
        }
        container.dataset.aboutBound = "1";

        const root = container.querySelector(".about");
        if (!root) {
            return;
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        window.setTimeout(() => {
            root.classList.add("is-visible");
        }, 80);

        const sections = Array.from(container.querySelectorAll(".about-section, .about-nav, .about-hero__inner"));
        sections.forEach((el) => {
            el.classList.remove("is-revealed");
        });

        if (prefersReducedMotion) {
            sections.forEach((el) => el.classList.add("is-revealed"));
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }
                    const el = entry.target;
                    io.unobserve(el);

                    const index = sections.indexOf(el);
                    const delay = Math.min(260, Math.max(0, index * 70));

                    window.setTimeout(() => {
                        el.classList.add("is-revealed");
                    }, delay);
                });
            },
            {
                root: null,
                threshold: 0.12,
                rootMargin: "0px 0px -10% 0px",
            }
        );

        sections.forEach((el) => io.observe(el));
    };
})();



