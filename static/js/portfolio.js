(function () {
    window.initPortfolioPage = function (container) {
        if (!container) {
            return;
        }

        if (container.dataset.portfolioBound === "1") {
            return;
        }
        container.dataset.portfolioBound = "1";
    };
})();
