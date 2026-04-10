/**
 * Haptic feedback via the Vibration API.
 * Only fires on mobile devices that support navigator.vibrate.
 * Durations:
 *   "light"  → 10ms  (tab tap, toggle, unfavorite)
 *   "medium" → 30ms  (add to wallet)
 *   "confirm"→ 50ms  (add to favorites, confirm action)
 */

type HapticStyle = "light" | "medium" | "confirm";

const DURATION: Record<HapticStyle, number | number[]> = {
  light:   10,
  medium:  30,
  confirm: 50,
};

export function haptic(style: HapticStyle = "light") {
  if (typeof navigator === "undefined") return;
  if (!("vibrate" in navigator)) return;
  // Avoid vibrating on non-touch / desktop devices
  if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;
  try {
    navigator.vibrate(DURATION[style]);
  } catch {
    // silently ignore – some browsers throw if permissions denied
  }
}
