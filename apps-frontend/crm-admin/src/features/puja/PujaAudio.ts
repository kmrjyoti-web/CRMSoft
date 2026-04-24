/**
 * PujaAudio — Web Audio API synthesizer for Puja sounds.
 * No external files required — all sounds are synthesized in-browser.
 */

type SoundKey =
  | 'bell_chime'
  | 'soft_chime'
  | 'om_chant'
  | 'aarti_bell'
  | 'temple_bell'
  | 'singing_bowl'
  | 'deep_resonance'
  | 'organ_chord'
  | 'waheguru_bell'
  | 'water_drop';

type ReligionCode = 'HINDU' | 'SIKH' | 'JAIN' | 'BUDDHIST' | 'MUSLIM' | 'CHRISTIAN' | 'UNIVERSAL';

// ── Audio helpers ──────────────────────────────────────────────────────────

function getCtx(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

/** Play a single bell tone — attack + exponential decay */
function playBellTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume = 0.25,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Add slight detuning for natural feel */
function playDetunedPair(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume = 0.18,
) {
  playBellTone(ctx, freq,       startTime, duration, volume);
  playBellTone(ctx, freq * 1.003, startTime, duration, volume * 0.6);
}

// ── Sound implementations ──────────────────────────────────────────────────

function playTemplateBell(ctx: AudioContext) {
  const t = ctx.currentTime;
  // Primary strike + harmonics
  playBellTone(ctx, 880,  t,        2.4, 0.28);
  playBellTone(ctx, 1760, t,        1.8, 0.12);   // 2nd harmonic
  playBellTone(ctx, 2640, t + 0.01, 1.2, 0.06);   // 3rd harmonic
  playBellTone(ctx, 528,  t + 0.05, 1.6, 0.08);   // sub-tone warmth
}

function playSoftChime(ctx: AudioContext) {
  const t = ctx.currentTime;
  playDetunedPair(ctx, 1047, t,        1.6, 0.22);   // C6
  playDetunedPair(ctx, 1319, t + 0.15, 1.4, 0.15);  // E6
  playDetunedPair(ctx, 1568, t + 0.30, 1.2, 0.10);  // G6
}

function playOmChant(ctx: AudioContext) {
  const t = ctx.currentTime;
  // OM fundamental ~136.1 Hz (Cosmic OM)
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gain = ctx.createGain();
  [osc1, osc2, osc3].forEach((o) => o.connect(gain));
  gain.connect(ctx.destination);

  osc1.type = 'sine';   osc1.frequency.setValueAtTime(136.1, t);
  osc2.type = 'sine';   osc2.frequency.setValueAtTime(272.2, t);   // 2nd harmonic
  osc3.type = 'triangle'; osc3.frequency.setValueAtTime(408.3, t); // 3rd harmonic

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.28, t + 0.3);      // swell in
  gain.gain.setValueAtTime(0.28, t + 1.8);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0); // fade out

  [osc1, osc2, osc3].forEach((o) => { o.start(t); o.stop(t + 3.0); });
}

function playAartiBell(ctx: AudioContext) {
  const t = ctx.currentTime;
  // Rapid sequence of bells
  const pattern = [0, 0.18, 0.36, 0.54, 0.75, 0.9, 1.2];
  pattern.forEach((offset, i) => {
    const freq = i % 2 === 0 ? 880 : 1047;
    playBellTone(ctx, freq, t + offset, 0.7, 0.22);
  });
  // Final sustained ring
  playBellTone(ctx, 880, t + 1.4, 2.0, 0.28);
}

function playSingingBowl(ctx: AudioContext) {
  const t = ctx.currentTime;
  // Tibetan singing bowl — 396 Hz with sustained vibrato
  const osc = ctx.createOscillator();
  const vibrato = ctx.createOscillator();
  const vibratoGain = ctx.createGain();
  const mainGain = ctx.createGain();

  vibrato.connect(vibratoGain);
  vibratoGain.connect(osc.frequency);
  osc.connect(mainGain);
  mainGain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(396, t);

  vibrato.type = 'sine';
  vibrato.frequency.setValueAtTime(5, t); // 5 Hz vibrato
  vibratoGain.gain.setValueAtTime(4, t);  // ±4 Hz pitch wobble

  mainGain.gain.setValueAtTime(0.0001, t);
  mainGain.gain.linearRampToValueAtTime(0.3, t + 0.4);
  mainGain.gain.setValueAtTime(0.3, t + 2.0);
  mainGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);

  vibrato.start(t); osc.start(t);
  vibrato.stop(t + 3.5); osc.stop(t + 3.5);

  // Add 2nd harmonic overtone
  playBellTone(ctx, 792, t + 0.1, 2.5, 0.08);
}

function playDeepResonance(ctx: AudioContext) {
  const t = ctx.currentTime;
  // Peaceful deep tone — 220 Hz with long sustain
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(0.25, t + 0.5);
  gain.gain.setValueAtTime(0.25, t + 2.0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
  osc.start(t); osc.stop(t + 3.5);
  // Soft upper tone for warmth
  playBellTone(ctx, 440, t + 0.2, 2.5, 0.08);
}

function playOrganChord(ctx: AudioContext) {
  const t = ctx.currentTime;
  // C major chord — C3, E3, G3, C4
  const freqs = [130.8, 164.8, 196.0, 261.6];
  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.2);
    gain.gain.setValueAtTime(0.12, t + 2.0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
    osc.start(t); osc.stop(t + 3.5);
  });
  // Soft bell overtop
  playBellTone(ctx, 1047, t + 0.3, 2.0, 0.1);
}

function playWaheguruBell(ctx: AudioContext) {
  const t = ctx.currentTime;
  // Waheguru resonance — 285 Hz (deep Sikh bell)
  playDetunedPair(ctx, 285,  t,        2.8, 0.22);
  playDetunedPair(ctx, 570,  t + 0.05, 2.0, 0.12);
  playDetunedPair(ctx, 855,  t + 0.08, 1.4, 0.07);
  // Follow-up bell
  playBellTone(ctx, 880, t + 0.5, 1.8, 0.18);
}

function playWaterDrop(ctx: AudioContext) {
  const t = ctx.currentTime;
  // Descending water-drop pitch
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, t);
  osc.frequency.exponentialRampToValueAtTime(400, t + 0.25);
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  osc.start(t); osc.stop(t + 0.5);
  // Second drop delayed
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.connect(gain2); gain2.connect(ctx.destination);
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(1000, t + 0.6);
  osc2.frequency.exponentialRampToValueAtTime(350, t + 0.85);
  gain2.gain.setValueAtTime(0.22, t + 0.6);
  gain2.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
  osc2.start(t + 0.6); osc2.stop(t + 1.1);
}

// ── Sound dispatch table ───────────────────────────────────────────────────

const SOUND_PLAYERS: Record<SoundKey, (ctx: AudioContext) => void> = {
  bell_chime:    playTemplateBell,
  soft_chime:    playSoftChime,
  om_chant:      playOmChant,
  aarti_bell:    playAartiBell,
  temple_bell:   playTemplateBell,
  singing_bowl:  playSingingBowl,
  deep_resonance: playDeepResonance,
  organ_chord:   playOrganChord,
  waheguru_bell: playWaheguruBell,
  water_drop:    playWaterDrop,
};

/** Religion → opening/welcome sound */
const RELIGION_SOUNDS: Record<ReligionCode, SoundKey> = {
  HINDU:     'temple_bell',
  SIKH:      'waheguru_bell',
  JAIN:      'soft_chime',
  BUDDHIST:  'singing_bowl',
  MUSLIM:    'deep_resonance',
  CHRISTIAN: 'organ_chord',
  UNIVERSAL: 'soft_chime',
};

/** Item sound code → SoundKey */
const ITEM_SOUND_MAP: Record<string, SoundKey> = {
  bell_chime: 'bell_chime',
  soft_chime: 'soft_chime',
  om_chant:   'om_chant',
  aarti_bell: 'aarti_bell',
  temple_bell:'temple_bell',
};

// ── Public API ─────────────────────────────────────────────────────────────

export const PujaAudio = {
  /** Play the welcome sound for a religion when overlay opens */
  playReligionWelcome(religion: ReligionCode): void {
    const ctx = getCtx();
    if (!ctx) return;
    const key = RELIGION_SOUNDS[religion] ?? 'soft_chime';
    SOUND_PLAYERS[key]?.(ctx);
  },

  /** Play the sound for a specific puja item */
  playItemSound(itemSoundCode: string): void {
    const ctx = getCtx();
    if (!ctx) return;
    const key = ITEM_SOUND_MAP[itemSoundCode] ?? 'bell_chime';
    SOUND_PLAYERS[key]?.(ctx);
  },

  /** Play a generic chime (fallback) */
  playChime(): void {
    const ctx = getCtx();
    if (!ctx) return;
    playSoftChime(ctx);
  },
};
