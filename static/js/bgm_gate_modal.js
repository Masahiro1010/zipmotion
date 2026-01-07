(function () {
    function getBgmEnabled() {
        return localStorage.getItem("bgmEnabled") === "1";
    }

    function setBgmEnabled(enabled) {
        localStorage.setItem("bgmEnabled", enabled ? "1" : "0");
    }

    function applyBgmState() {
        if (typeof window.applyBgmState === "function") {
            window.applyBgmState();
        }
        if (typeof window.refreshToggleUI === "function") {
            window.refreshToggleUI();
        }
    }

    function setActive(items, index) {
        items.forEach((el, i) => {
            if (i === index) {
                el.classList.add("is-active");
            } else {
                el.classList.remove("is-active");
            }
        });
    }

    function resetIntro(container) {
        const intro = container.querySelector("#intro");
        const gate = container.querySelector("#gate");
        const barFill = container.querySelector(".intro__bar-fill");
        const bar = container.querySelector(".intro__bar");

        if (intro) {
            intro.classList.add("is-active");
        }

        if (gate) {
            gate.classList.add("is-hidden");
            gate.classList.remove("is-shown");
        }

        if (barFill) {
            barFill.style.width = "0%";
        }

        if (bar) {
            bar.setAttribute("aria-valuenow", "0");
        }
    }

    function runIntro(container) {
        const intro = container.querySelector("#intro");
        const gate = container.querySelector("#gate");
        const barFill = container.querySelector(".intro__bar-fill");
        const bar = container.querySelector(".intro__bar");

        if (!intro || !gate || !barFill || !bar) {
            if (gate) {
                gate.classList.remove("is-hidden");
                gate.classList.add("is-shown");
            }
            return Promise.resolve();
        }

        let done = false;
        let progress = 0;
        let timer = null;

        function finish() {
            if (done) {
                return;
            }
            done = true;

            intro.classList.remove("is-active");
            gate.classList.remove("is-hidden");
            gate.classList.add("is-shown");

            window.removeEventListener("keydown", onSkipKey);
            intro.removeEventListener("click", onSkipClick);

            if (timer) {
                clearInterval(timer);
            }
        }

        function onSkipKey(e) {
            const key = e.key;
            if (key === "Enter" || key === " " || key === "Spacebar") {
                e.preventDefault();
                finish();
            }
        }

        function onSkipClick() {
            finish();
        }

        window.addEventListener("keydown", onSkipKey);
        intro.addEventListener("click", onSkipClick);

        return new Promise((resolve) => {
            timer = setInterval(() => {
                if (done) {
                    clearInterval(timer);
                    resolve();
                    return;
                }

                progress += 6 + Math.floor(Math.random() * 8);
                if (progress >= 100) {
                    progress = 100;
                }

                bar.setAttribute("aria-valuenow", String(progress));
                barFill.style.width = `${progress}%`;

                if (progress >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        finish();
                        resolve();
                    }, 320);
                }
            }, 120);
        });
    }

    function initMenuControls(container, modalInstance) {
        const items = Array.from(container.querySelectorAll(".menu__item[data-bgm]"));
        if (items.length === 0) {
            return;
        }

        let activeIndex = getBgmEnabled() ? 0 : 1;
        setActive(items, activeIndex);

        function decide() {
            const btn = items[activeIndex];
            if (!btn) {
                return;
            }

            const enabled = btn.dataset.bgm === "on";
            setBgmEnabled(enabled);
            applyBgmState();

            document.querySelector('[data-barba="container"]')?.dispatchEvent(new Event("bgm:decided"));


            modalInstance?.hide();
        }

        items.forEach((btn, i) => {
            btn.addEventListener("click", () => {
                activeIndex = i;
                setActive(items, activeIndex);
                decide();
            });
        });

        function onKeyDown(e) {
            const key = e.key;

            if (key === "ArrowUp" || key === "w" || key === "W") {
                e.preventDefault();
                activeIndex = (activeIndex - 1 + items.length) % items.length;
                setActive(items, activeIndex);
                return;
            }

            if (key === "ArrowDown" || key === "s" || key === "S") {
                e.preventDefault();
                activeIndex = (activeIndex + 1) % items.length;
                setActive(items, activeIndex);
                return;
            }

            if (key === "Enter") {
                e.preventDefault();
                decide();
                return;
            }
        }

        window.addEventListener("keydown", onKeyDown);

        container.addEventListener("modal:cleanup", () => {
            window.removeEventListener("keydown", onKeyDown);
        }, { once: true });
    }

    async function boot(modalEl) {
        const container = modalEl.querySelector(".bgm-modal-screen");
        if (!container) {
            return;
        }

        resetIntro(container);

        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl, {
            backdrop: "static",
            keyboard: false,
            focus: true,
        });

        await runIntro(container);
        initMenuControls(container, modalInstance);
    }

    window.initBgmRetroModal = function () {
        const modalEl = document.getElementById("bgmModal");
        if (!modalEl) {
            return;
        }

        if (modalEl.dataset.retroBound === "1") {
            return;
        }
        modalEl.dataset.retroBound = "1";

        modalEl.addEventListener("shown.bs.modal", async () => {
            await boot(modalEl);
        });

        modalEl.addEventListener("hidden.bs.modal", () => {
            const container = modalEl.querySelector(".bgm-modal-screen");
            container?.dispatchEvent(new Event("modal:cleanup"));
        });
    };
})();

