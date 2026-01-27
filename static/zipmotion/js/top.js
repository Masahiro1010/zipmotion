(function () {
    "use strict";

    const fillEl = document.getElementById("gaugeFill");
    const pctEl = document.getElementById("gaugePct");

    // ===== Config =====
    // ゲージを満タンにするのに必要な「仮想スクロール量(px相当)」
    // 値を大きくすると溜まりにくい（=ロックが長い）
    const CHARGE_DISTANCE = 900;

    // タッチの感度（大きいほど溜まりやすい）
    const TOUCH_GAIN = 1.0;

    // ===== State =====
    let charge = 0;              // 0..CHARGE_DISTANCE
    let unlocked = false;

    // ===== Helpers =====
    function clamp(v, min, max) {
        return Math.min(max, Math.max(min, v));
    }

    function setGauge(progress01) {
        const pct = Math.round(progress01 * 100);

        if (fillEl) {
            fillEl.style.width = `${pct}%`;
        }
        if (pctEl) {
            pctEl.textContent = `${pct}%`;
        }
    }

    function getProgress01() {
        return clamp(charge / CHARGE_DISTANCE, 0, 1);
    }

    function tryUnlock() {
        if (unlocked) return;

        if (charge >= CHARGE_DISTANCE) {
            unlocked = true;
            charge = CHARGE_DISTANCE;
            setGauge(1);

            // 解除した瞬間に「少しだけ」下へ進ませたいならここでscrollしてもOK
            // window.scrollTo({ top: 1, behavior: "smooth" });
        }
    }

    function addCharge(amount) {
        if (unlocked) return;

        charge = clamp(charge + amount, 0, CHARGE_DISTANCE);
        setGauge(getProgress01());
        tryUnlock();
    }

    function isDownIntentFromWheel(e) {
        // wheel: deltaY > 0 が下方向
        return e.deltaY > 0;
    }

    function isDownIntentFromKey(e) {
        // 下方向へ進むキー操作をブロック対象に
        const keys = [
            "ArrowDown",
            "PageDown",
            "End",
            " ",
            "Spacebar"
        ];
        return keys.includes(e.key);
    }

    // ===== Lock Behaviors =====
    function onWheel(e) {
        if (unlocked) return;

        // 下へ行こうとした分だけゲージを貯める
        if (isDownIntentFromWheel(e)) {
            e.preventDefault();

            // deltaYは環境で差があるので、ほどほどにクランプして加算
            const amt = clamp(e.deltaY, 0, 120);
            addCharge(amt);
            return;
        }

        // 上方向は自由（ページ上端なので実質変化しない）
    }

    // Touch: 下へスクロール = 指が上へ動く（touchmoveで y が減る）
    let touchLastY = null;

    function onTouchStart(e) {
        if (!e.touches || e.touches.length === 0) return;
        touchLastY = e.touches[0].clientY;
    }

    function onTouchMove(e) {
        if (unlocked) return;
        if (!e.touches || e.touches.length === 0) return;
        if (touchLastY === null) {
            touchLastY = e.touches[0].clientY;
            return;
        }

        const y = e.touches[0].clientY;
        const dy = y - touchLastY; // 指が下に動くと +、上に動くと -
        touchLastY = y;

        // 指が上に動く（dy < 0）= 画面を下へスクロールしようとしている
        if (dy < 0) {
            e.preventDefault();

            const amt = clamp((-dy) * TOUCH_GAIN, 0, 60);
            addCharge(amt);
        }
    }

    function onKeyDown(e) {
        if (unlocked) return;

        if (isDownIntentFromKey(e)) {
            e.preventDefault();

            // キーは一定量チャージ
            addCharge(45);
        }
    }

    function keepAtTopWhileLocked() {
        if (unlocked) return;

        // 何らかの理由でスクロール位置が動いたら上に戻す
        if (window.scrollY > 0) {
            window.scrollTo(0, 0);
        }
    }

    // ===== Init =====
    // 初期は必ずトップに固定
    window.scrollTo(0, 0);
    setGauge(0);

    // 注意: wheel/touchmove は preventDefault するので passive:false が必須
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    // 念のためロック中はトップ維持
    window.addEventListener("scroll", keepAtTopWhileLocked, { passive: true });
})();

