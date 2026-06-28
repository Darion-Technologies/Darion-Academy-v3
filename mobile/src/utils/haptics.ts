import { Vibration, Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

// ─────────────────────────────────────────────
//  Primitives — raw single impulses
// ─────────────────────────────────────────────

const _impact = async (style: ExpoHaptics.ImpactFeedbackStyle) => {
  if (Platform.OS === 'android') {
    const ms =
      style === ExpoHaptics.ImpactFeedbackStyle.Light  ? 8  :
      style === ExpoHaptics.ImpactFeedbackStyle.Medium ? 22 :
      style === ExpoHaptics.ImpactFeedbackStyle.Heavy  ? 50 : 14;
    Vibration.vibrate(ms);
  } else {
    await ExpoHaptics.impactAsync(style);
  }
};

const _notify = async (type: ExpoHaptics.NotificationFeedbackType) => {
  if (Platform.OS === 'android') {
    const pattern =
      type === ExpoHaptics.NotificationFeedbackType.Success ? [0, 18, 55, 38]   :
      type === ExpoHaptics.NotificationFeedbackType.Warning  ? [0, 28, 30, 28]   :
      /* Error */                                              [0, 35, 35, 35, 35, 50];
    Vibration.vibrate(pattern);
  } else {
    await ExpoHaptics.notificationAsync(type);
  }
};

/** Sleep helper for multi-beat sequences */
const _sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────
//  Async sequence runner
//  beats: array of [style, delayBeforeMs]
// ─────────────────────────────────────────────
type Beat =
  | { kind: 'impact'; style: ExpoHaptics.ImpactFeedbackStyle; delay?: number }
  | { kind: 'notify'; type: ExpoHaptics.NotificationFeedbackType; delay?: number }
  | { kind: 'selection'; delay?: number };

async function _sequence(beats: Beat[]) {
  for (const beat of beats) {
    if (beat.delay) await _sleep(beat.delay);
    if (beat.kind === 'impact') await _impact(beat.style);
    else if (beat.kind === 'notify') await _notify(beat.type);
    else {
      if (Platform.OS === 'android') Vibration.vibrate(5);
      else await ExpoHaptics.selectionAsync();
    }
  }
}

// ─────────────────────────────────────────────
//  Haptics — Public API
// ─────────────────────────────────────────────

export const Haptics = {
  // ── STANDARD ─────────────────────────────

  /** Barely-there pixel-click. Scroll highlights, tab switches. */
  selection: () => _sequence([{ kind: 'selection' }]),

  /** Quick light tap. Card touches, icon taps. */
  light: () => _sequence([{ kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light }]),

  /** Solid thud. Primary buttons, toggles. */
  medium: () => _sequence([{ kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium }]),

  /** Deep press. Destructive actions, long-press confirms. */
  heavy: () => _sequence([{ kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy }]),

  // ── EXPRESSIVE PREMIUM ───────────────────

  /**
   * ✅ Success — "Rising double-tap"
   * soft → [gap] → firm: feels like a satisfying lock-click.
   */
  success: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 100 },
    ]),

  /**
   * ❌ Error — "Triple stutter"
   * Three sharp medium pulses rapid-fire, brain reads it as friction/rejection.
   */
  error: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 70 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy,  delay: 70 },
    ]),

  /**
   * ⚠️ Warning — "Double nudge"
   * Two medium taps with a clear gap: "pay attention".
   */
  warning: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 120 },
    ]),

  /**
   * 🎉 Celebration — "Cascade burst"
   * Light → Medium → Heavy → [pause] → Light: fireworks feeling.
   * Use for course completions, streaks, achievements.
   */
  celebrate: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 80 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy,  delay: 80 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light,  delay: 160 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light,  delay: 60 },
    ]),

  /**
   * 🔒 Lock — "Double-click confirm"
   * Medium → [short gap] → Heavy: feels like a physical latch.
   * Use for secure actions, sign-out confirms, modal closes.
   */
  lock: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy, delay: 85 },
    ]),

  /**
   * 🪄 Magic — "Heartbeat"
   * Heavy → [long gap] → Light → Light:
   * Use for unlocking premium content, loading reveals.
   */
  magic: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light, delay: 200 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light, delay: 60  },
    ]),

  /**
   * 📋 Copy — "Tick-tock"
   * Light → Medium: clean 2-step "got it" feel.
   */
  copy: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 90 },
    ]),

  /**
   * 🗑 Delete — "Hard thud"
   * Heavy single pulse. No ambiguity — this is final.
   */
  delete: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy },
    ]),

  /**
   * ⬆️ Upload / Submit — "Rise"
   * Light → Light → Medium: ascending ramp, optimistic feel.
   */
  submit: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light,  delay: 70 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 90 },
    ]),

  /**
   * 🔔 Notification ping — "Soft bell"
   * Selection → [gap] → Light: gentle arrival feel.
   */
  ping: () =>
    _sequence([
      { kind: 'selection' },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light, delay: 80 },
    ]),

  /**
   * 📖 Page turn — "Swipe confirm"
   * Medium → Light: primary push followed by a light follow-through.
   */
  pageTurn: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light, delay: 60 },
    ]),

  /**
   * ⭐ Streak milestone — "Pulse burst"
   * Quick Medium triplet: thrumming excitement. 
   * Use for 7-day, 30-day streaks etc.
   */
  streak: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 55 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium, delay: 55 },
    ]),

  /**
   * 🏆 Achievement unlocked — "Grand slam"
   * Medium → Heavy → [pause] → Light → Light → Light:
   * Used for certificate earned, course complete, badge unlocked.
   */
  achievement: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Medium },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Heavy,  delay: 80 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light,  delay: 220 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light,  delay: 55 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light,  delay: 55 },
    ]),

  /**
   * 🔄 Refresh — "Spin-up"
   * Selection → Selection → Light: lightweight spinning feedback.
   */
  refresh: () =>
    _sequence([
      { kind: 'selection' },
      { kind: 'selection', delay: 60 },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light, delay: 80 },
    ]),

  /**
   * Accordion open/close — "Snap"
   * Light → Light: clean bi-directional snap.
   */
  snap: () =>
    _sequence([
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light },
      { kind: 'impact', style: ExpoHaptics.ImpactFeedbackStyle.Light, delay: 50 },
    ]),
};

// ─────────────────────────────────────────────
//  Semantic aliases — map intent → pattern
//  Use these in components instead of primitives
// ─────────────────────────────────────────────
export const HapticEvent = {
  tabPress:          Haptics.selection,
  buttonPrimary:     Haptics.medium,
  buttonDestructive: Haptics.delete,
  formSuccess:       Haptics.success,
  formError:         Haptics.error,
  loginSuccess:      Haptics.magic,
  logoutConfirm:     Haptics.lock,
  courseComplete:    Haptics.achievement,
  lessonComplete:    Haptics.celebrate,
  streakMilestone:   Haptics.streak,
  badgeUnlocked:     Haptics.achievement,
  notificationArrive:Haptics.ping,
  accordionToggle:   Haptics.snap,
  pullToRefresh:     Haptics.refresh,
  copyToClipboard:   Haptics.copy,
  submitAssignment:  Haptics.submit,
  pageTurn:          Haptics.pageTurn,
  warningAlert:      Haptics.warning,
} as const;
