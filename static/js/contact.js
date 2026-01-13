(function () {
    window.initContactPage = function (container) {
        if (!container) {
            return;
        }

        if (container.dataset.contactBound === "1") {
            return;
        }
        container.dataset.contactBound = "1";
    };
})();
