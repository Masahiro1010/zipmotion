// =============================
// BGM core (Howler + localStorage)
// =============================
const BGM_KEY = "bgmEnabled";
const DEFAULT_ENABLED = false;

window.globalBGM = window.globalBGM || null;

function ensureBgmInstance() {
    if (window.globalBGM) {
        return;
    }

    window.globalBGM = new Howl({
        src: ["/static/audio/mainBGM.mp3"],
        loop: true,
        volume: 0.4,
    });
}

function getBgmEnabled() {
    const value = localStorage.getItem(BGM_KEY);

    if (value === null) {
        return DEFAULT_ENABLED;
    }

    return value === "1";
}

function setBgmEnabled(enabled) {
    localStorage.setItem(BGM_KEY, enabled ? "1" : "0");
}

function applyBgmState() {
    ensureBgmInstance();

    const enabled = getBgmEnabled();

    if (enabled) {
        if (!window.globalBGM.playing()) {
            window.globalBGM.play();
        }
    } else {
        if (window.globalBGM.playing()) {
            window.globalBGM.stop();
        }
    }
}

function refreshToggleUI() {
    const fab = document.getElementById("bgm-fab");

    if (!fab) {
        return;
    }

    fab.dataset.enabled = getBgmEnabled() ? "1" : "0";
}

// =============================
// Bootstrap Modal helpers
// =============================
function getBgmModalInstance() {
    const element = document.getElementById("bgmModal");

    if (!element) {
        return null;
    }

    return bootstrap.Modal.getOrCreateInstance(element, {
        backdrop: true,
        keyboard: true,
        focus: true,
    });
}

function updateModalStatusText() {
    const status = document.getElementById("bgm-status-text");

    if (!status) {
        return;
    }

    status.textContent = `現在：${getBgmEnabled() ? "ON" : "OFF"}`;
}

function openBgmModal() {
    updateModalStatusText();

    const modal = getBgmModalInstance();
    modal?.show();
}

function cleanupBootstrapModals() {
    document.querySelectorAll(".modal.show").forEach((modal) => {
        const instance = bootstrap.Modal.getInstance(modal);
        instance?.hide();
    });

    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
        backdrop.remove();
    });

    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("padding-right");
}

// =============================
// Bind UI (only once)
// =============================
function bindBgmUIOnce() {
    if (document.body.dataset.bgmUiBound === "1") {
        return;
    }

    document.body.dataset.bgmUiBound = "1";

    const toggleBtn = document.getElementById("bgm-toggle-btn");
    const settingsBtn = document.getElementById("bgm-open-settings");
    const modalEl = document.getElementById("bgmModal");

    toggleBtn?.addEventListener("click", () => {
        const next = !getBgmEnabled();
        setBgmEnabled(next);

        applyBgmState();
        refreshToggleUI();
    });

    settingsBtn?.addEventListener("click", () => {
        openBgmModal();
    });

    modalEl?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-bgm-choice]");

        if (!button) {
            return;
        }

        if (button.dataset.bgmChoice === "on") {
            setBgmEnabled(true);
        }

        if (button.dataset.bgmChoice === "off") {
            setBgmEnabled(false);
        }

        applyBgmState();
        refreshToggleUI();
        updateModalStatusText();

        const instance = getBgmModalInstance();
        instance?.hide();
    });

    modalEl?.addEventListener("show.bs.modal", updateModalStatusText);
}

// =============================
// Init
// =============================
function initAppOnce() {
    bindBgmUIOnce();
    applyBgmState();
    refreshToggleUI();
    window.initBgmRetroModal?.();
}

initAppOnce();


// =============================
// Barba Fede Transition
// =============================
function getFadeOverlayEl() {
    return document.getElementById("barba-fade-overlay");
}

function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fadeToBlack() {
    const el = getFadeOverlayEl();
    if (!el) {
        return;
    }

    el.classList.add("is-visible");

    // 暗転が完了するまで待つ（CSS 720ms + 余裕）
    await wait(780);

    // 黒の最大状態をほんの少し保持（映画っぽくなる）
    await wait(120);
}

async function fadeFromBlack() {
    const el = getFadeOverlayEl();
    if (!el) {
        return;
    }

    // About側が描画できてから明転したいので、1フレーム待つ
    await wait(30);

    el.classList.remove("is-visible");

    // 明転が完了するまで待つ
    await wait(780);
}


// =============================
// Barba
// =============================
barba.init({
    transitions: [
        {
            name: "fade-black-smooth",

            async leave(data) {
                // まず暗転（これでTopが自然に見えなくなる）
                await fadeToBlack();

                // 暗転しきった後に旧コンテナを隠す（チラつき防止）
                if (data.current?.container) {
                    data.current.container.style.visibility = "hidden";
                }
            },

            async enter(data) {
                window.scrollTo(0, 0);

                // 新コンテナは見える状態にしておく（黒の裏で準備）
                if (data.next?.container) {
                    data.next.container.style.visibility = "visible";
                }

                // 明転（ここでAboutが滑らかに出てくる）
                await fadeFromBlack();
            },

            after(data) {
                // 次の遷移のために戻す
                if (data.current?.container) {
                    data.current.container.style.visibility = "";
                }
            },
        },
    ],
});



barba.hooks.beforeEnter(() => {
    cleanupBootstrapModals();
});

barba.hooks.afterEnter((data) => {
    bindBgmUIOnce();
    applyBgmState();
    refreshToggleUI();

    if (data.next?.namespace === "Top") {
        window.initTopPage?.(data.next.container);
        openBgmModal();
    }

    if (data.next?.namespace === "About") {
        window.initAboutPage?.(data.next.container);
    }

    if (data.next?.namespace === "Portfolio") {
        window.initPortfolioPage?.(data.next.container);
    }

    if (data.next?.namespace === "Contact") {
        window.initContactPage?.(data.next.container);
    }
});

function initAppOnce() {
    bindBgmUIOnce();
    window.initBgmRetroModal?.();
    applyBgmState();
    refreshToggleUI();
}
