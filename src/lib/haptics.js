const IOS_TICK_SPACING = 34;

const CUES = Object.freeze({
  tick: { android: 9, ios: 1, channel: "texture" },
  press: { android: 18, ios: 1, channel: "ui" },
  stateOn: { android: [16, 44, 30], ios: 2, channel: "ui" },
  stateOff: { android: [30, 44, 16], ios: 3, channel: "ui" },
  commit: { android: [20, 40, 38], ios: 3, channel: "ui" },
  reveal: { android: [14, 80, 22, 80, 40], ios: 5, channel: "ui" },
});

const CHANNELS = {
  ui: { last: -Infinity, cooldown: 24 },
  texture: { last: -Infinity, cooldown: IOS_TICK_SPACING },
};

let supportChecked = false;
let supported = false;
let isIOS = false;

function detectSupport() {
  if (supportChecked) return supported;
  supportChecked = true;

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const coarse = window.matchMedia?.("(any-pointer: coarse)").matches === true;
  const firefox = /Gecko\/|Firefox\//.test(navigator.userAgent);
  isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  supported =
    coarse && !firefox && typeof navigator.vibrate === "function";
  return supported;
}

function playIOS(taps) {
  navigator.vibrate(1);
  for (let index = 1; index < taps; index += 1) {
    window.setTimeout(() => {
      if (document.visibilityState === "visible") navigator.vibrate(1);
    }, index * IOS_TICK_SPACING);
  }
  return true;
}

export function haptic(cue = "press", { force = false } = {}) {
  if (!detectSupport() || document.visibilityState !== "visible") return false;

  const spec = CUES[cue];
  if (!spec) return false;

  const channel = CHANNELS[spec.channel];
  const now = performance.now();
  if (!force && now - channel.last < channel.cooldown) return false;
  channel.last = now;

  try {
    return isIOS ? playIOS(spec.ios) : navigator.vibrate(spec.android);
  } catch {
    return false;
  }
}

function eligibleControl(target, root) {
  if (!(target instanceof Element)) return null;

  const control = target.closest(
    'button,a[href],input,select,summary,[role="button"],[role="option"],[role="tab"],[role="checkbox"],[role="switch"],[role="radio"]',
  );
  if (
    !control ||
    !root.contains(control) ||
    control.closest('[inert], [aria-disabled="true"]') ||
    control.matches(":disabled")
  ) {
    return null;
  }
  return control;
}

export function installHaptics(root) {
  if (!root) return () => {};

  const onClick = (event) => {
    const control = eligibleControl(event.target, root);
    if (
      !control ||
      control.matches(
        'select,input:not([type="button"]):not([type="submit"]):not([type="reset"])',
      )
    ) {
      return;
    }
    haptic("press");
  };

  const onChange = (event) => {
    const control = eligibleControl(event.target, root);
    if (
      control?.matches(
        'select,input[type="checkbox"],input[type="radio"],input[type="range"],input[type="file"]',
      )
    ) {
      haptic("stateOn");
    }
  };

  root.addEventListener("click", onClick);
  root.addEventListener("change", onChange);

  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("change", onChange);
  };
}
