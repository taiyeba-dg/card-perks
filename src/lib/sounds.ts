/**
 * Synthesised UI micro-sounds via Web Audio API.
 * Zero external files – tiny oscillator bursts that feel native.
 *
 * Respects a localStorage "cardperks-sounds" flag (default: on).
 */

type SoundStyle = "tap" | "pop" | "chime" | "switch";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx || ctx.state === "closed") {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Check if sounds are enabled (defaults to true). */
export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem("cardperks-sounds") !== "off";
  } catch {
    return true;
  }
}

export function setSoundEnabled(on: boolean) {
  try {
    localStorage.setItem("cardperks-sounds", on ? "on" : "off");
  } catch {}
}

/**
 * Play a micro-sound.
 *   "tap"    – short click for nav / light actions  (≈25ms)
 *   "pop"    – bubbly pop for favorites              (≈80ms)
 *   "chime"  – two-note confirmation for wallet      (≈180ms)
 *   "switch" – toggle click for theme switch          (≈30ms)
 */
export function playSound(style: SoundStyle = "tap") {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;

  switch (style) {
    case "tap": {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(1800, now);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      o.connect(g).connect(ac.destination);
      o.start(now);
      o.stop(now + 0.05);
      break;
    }

    case "pop": {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(1200, now);
      o.frequency.exponentialRampToValueAtTime(400, now + 0.08);
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      o.connect(g).connect(ac.destination);
      o.start(now);
      o.stop(now + 0.15);
      break;
    }

    case "chime": {
      [880, 1320].forEach((freq, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        const t = now + i * 0.09;
        o.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.3, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        o.connect(g).connect(ac.destination);
        o.start(now);
        o.stop(t + 0.18);
      });
      break;
    }

    case "switch": {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(600, now);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      o.connect(g).connect(ac.destination);
      o.start(now);
      o.stop(now + 0.04);
      break;
    }
  }
}
