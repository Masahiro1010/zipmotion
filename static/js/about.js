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

        window.setTimeout(() => {
            root.classList.add("is-visible");
        }, 120);
    };
})();

