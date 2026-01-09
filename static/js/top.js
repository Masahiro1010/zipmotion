(function () {
    function openMenu(container) {
        const overlay = container.querySelector("#menu-overlay");
        if (!overlay) {
            return;
        }

        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
    }

    function closeMenu(container) {
        const overlay = container.querySelector("#menu-overlay");
        if (!overlay) {
            return;
        }

        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
    }

    function showZipmotion(container) {
        const title = container.querySelector("#zipmotion-title");
        if (!title) {
            return;
        }
    
        title.classList.add("is-show");
        title.setAttribute("aria-hidden", "false");
    
        window.setTimeout(() => {
            title.classList.add("is-live");
            startZipmotionRandomPulse(container);
        }, 950);
    }
    

    function startZipmotionRandomPulse(container) {
        const title = container.querySelector("#zipmotion-title");
        if (!title) {
            return;
        }
    
        function schedulePulse() {
            // 次の発火までの待ち時間（ミリ秒）
            const delay = 3000 + Math.random() * 4000; // 3〜7秒
    
            window.setTimeout(() => {
                title.classList.add("is-pulse");
    
                // ビリビリ時間（短く）
                window.setTimeout(() => {
                    title.classList.remove("is-pulse");
                    schedulePulse();
                }, 320);
            }, delay);
        }
    
        schedulePulse();
    }
    
    

    function setMenuReady(container) {
        const openBtn = container.querySelector("#menu-open");
        if (!openBtn) {
            return;
        }

        openBtn.classList.remove("is-locked");
        openBtn.classList.add("is-ready");
        openBtn.setAttribute("aria-disabled", "false");
    }

    function bindTopUI(container) {
        if (!container) {
            return;
        }

        if (container.dataset.topBound === "1") {
            return;
        }
        container.dataset.topBound = "1";

        const openBtn = container.querySelector("#menu-open");
        const closeBtn = container.querySelector("#menu-close");
        const overlay = container.querySelector("#menu-overlay");

        openBtn?.addEventListener("click", () => {
            if (openBtn.classList.contains("is-ready")) {
                openMenu(container);
            }
        });

        closeBtn?.addEventListener("click", () => closeMenu(container));

        overlay?.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeMenu(container);
            }
        });

        container.addEventListener("bgm:decided", () => {
            showZipmotion(container);
            setMenuReady(container);
        });
    }

    window.initTopPage = function (container) {
        bindTopUI(container);
    };
})();

