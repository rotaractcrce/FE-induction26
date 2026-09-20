/**
 * RC haptics - inspired by Footslog's haptics lib.
 * iOS WebKit: toggles a hidden off-screen switch (native taptic) via label.click().
 * Android/others: navigator.vibrate.
 * - Tap pulses fire from real user gestures (delegated click/change).
 * - Auto pulses (animation moments) only fire after the first user gesture
 *   (armed flag), so the first section never buzzes on its own.
 * - Touch-safe: only click/change listeners, no preventDefault, no touch
 *   interception; focus is preserved around iOS trigger clicks.
 */
(function () {
  var TRIGGER_ID = "rc-haptic-switch";
  var triggerLabel = null;
  var armed = false;
  var last = -Infinity;

  function arm() {
    armed = true;
  }
  ["pointerdown", "touchstart", "wheel", "keydown"].forEach(function (ev) {
    try {
      window.addEventListener(ev, arm, { passive: true, capture: true });
    } catch (_) {
      window.addEventListener(ev, arm, true);
    }
  });

  function ensureTrigger() {
    if (
      typeof document === "undefined" ||
      typeof document.createElement !== "function"
    )
      return null;
    if (!triggerLabel) {
      var label = document.createElement("label");
      label.htmlFor = TRIGGER_ID;
      label.setAttribute("aria-hidden", "true");
      label.style.position = "fixed";
      label.style.top = "-9999px";
      label.style.left = "-9999px";
      label.style.width = "1px";
      label.style.height = "1px";
      label.style.opacity = "0.001";
      label.style.pointerEvents = "none";
      label.style.overflow = "hidden";
      label.style.zIndex = "-9999";

      var input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("switch", "");
      input.id = TRIGGER_ID;
      input.tabIndex = -1;
      input.setAttribute("aria-hidden", "true");
      input.style.position = "fixed";
      input.style.top = "-9999px";
      input.style.left = "-9999px";
      input.style.width = "1px";
      input.style.height = "1px";
      input.style.opacity = "0.001";
      input.style.pointerEvents = "none";

      label.appendChild(input);
      if (document.body) document.body.appendChild(label);
      triggerLabel = label;
    }
    return triggerLabel;
  }

  function restoreFocus(activeElement) {
    if (
      activeElement &&
      document.activeElement !== activeElement &&
      typeof activeElement.focus === "function"
    ) {
      try {
        activeElement.focus({ preventScroll: true });
      } catch (_) {}
    }
  }

  function iosTick(ticks) {
    var label = ensureTrigger();
    if (!label) return;
    var activeElement =
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    try {
      label.click();
    } catch (_) {}
    restoreFocus(activeElement);
    if (ticks > 1) {
      window.setTimeout(function () {
        if (
          typeof document !== "undefined" &&
          document.visibilityState === "hidden"
        )
          return;
        try {
          label.click();
        } catch (_) {}
        restoreFocus(activeElement);
      }, 45);
    }
  }

  function isIos() {
    if (typeof navigator === "undefined") return false;
    var ua = navigator.userAgent || "";
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }

  function rawPulse(ticks) {
    if (typeof document !== "undefined" && document.visibilityState === "hidden")
      return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      !window.matchMedia("(any-pointer: coarse)").matches
    )
      return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    var now =
      typeof performance !== "undefined" && performance.now
        ? performance.now()
        : Date.now();
    if (now - last < 60) return;
    last = now;
    if (isIos()) {
      iosTick(ticks);
      return;
    }
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(ticks > 1 ? [16, 44, 30] : 18);
      } catch (_) {}
    }
  }

  function eligible(target) {
    if (!(target instanceof Element)) return null;
    var control = target.closest(
      'button,a[href],input,select,summary,[role="button"],[role="option"],[role="tab"],[role="checkbox"],[role="switch"],[role="radio"]',
    );
    if (
      !control ||
      control.closest("[inert],[aria-disabled='true']") ||
      control.matches(":disabled")
    )
      return null;
    return control;
  }

  document.addEventListener(
    "click",
    function (e) {
      var control = eligible(e.target);
      if (
        !control ||
        control.matches(
          'select,input:not([type="button"]):not([type="submit"]):not([type="reset"])',
        )
      )
        return;
      rawPulse(1);
    },
  );
  document.addEventListener("change", function (e) {
    var control = eligible(e.target);
    if (
      control &&
      control.matches(
        'select,input[type="checkbox"],input[type="radio"],input[type="range"],input[type="file"]',
      )
    )
      rawPulse(2);
  });

  if (isIos()) ensureTrigger();

  window.RCHaptics = {
    /* Auto pulses (animation moments) - require a prior user gesture. */
    pulse: function (ticks) {
      if (armed) rawPulse(ticks || 1);
    },
    /* Direct tap pulses - caller guarantees a gesture. */
    tap: function (ticks) {
      rawPulse(ticks || 1);
    },
  };
})();
