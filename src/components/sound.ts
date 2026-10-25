let ctx: AudioContext | null = null;
const ac = () => (ctx ??= new AudioContext());

function noise(seconds: number) {
  const c = ac();
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  return src;
}

export function wind(seconds = 9) {
  const c = ac();
  const src = noise(seconds);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(300, c.currentTime);
  f.frequency.linearRampToValueAtTime(1400, c.currentTime + seconds * 0.8);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.35, c.currentTime + 1.5);
  g.gain.linearRampToValueAtTime(0, c.currentTime + seconds);
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}

export function impact() {
  const c = ac();
  const o = c.createOscillator();
  const g = c.createGain();
  o.frequency.setValueAtTime(120, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(30, c.currentTime + 0.8);
  g.gain.setValueAtTime(0.8, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.2);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 1.3);
  const n = noise(0.6);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.4, c.currentTime);
  ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
  n.connect(ng).connect(c.destination);
  n.start();
}

export function chime(freq = 660) {
  const c = ac();
  [1, 1.5, 2].forEach((m, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq * m;
    g.gain.setValueAtTime(0.12 / (i + 1), c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 2.6);
  });
}

export function rumble(seconds = 3) {
  const c = ac();
  const src = noise(seconds);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 120;
  const g = c.createGain();
  g.gain.setValueAtTime(0.6, c.currentTime);
  g.gain.linearRampToValueAtTime(0, c.currentTime + seconds);
  src.connect(f).connect(g).connect(c.destination);
  src.start();
}

export function spellCast() {
  const c = ac();
  // High frequency magic whoosh + rising sparkle
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(400, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2200, c.currentTime + 0.4);
  osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.8);
  gain.gain.setValueAtTime(0.4, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.9);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.95);

  const n = noise(0.7);
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(1200, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(3200, c.currentTime + 0.5);
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.3, c.currentTime);
  ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.7);
  n.connect(f).connect(ng).connect(c.destination);
  n.start();
}

export function fireBreath(seconds = 2) {
  const c = ac();
  const n = noise(seconds);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.setValueAtTime(600, c.currentTime);
  f.frequency.linearRampToValueAtTime(1800, c.currentTime + seconds * 0.4);
  f.frequency.linearRampToValueAtTime(400, c.currentTime + seconds);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.7, c.currentTime + 0.3);
  g.gain.linearRampToValueAtTime(0, c.currentTime + seconds);
  n.connect(f).connect(g).connect(c.destination);
  n.start();
}

export function dragonRoar() {
  const c = ac();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(180, c.currentTime);
  osc.frequency.linearRampToValueAtTime(90, c.currentTime + 0.6);
  osc.frequency.exponentialRampToValueAtTime(45, c.currentTime + 1.8);
  g.gain.setValueAtTime(0.6, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.0);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 2.1);
  fireBreath(2.2);
}

export function eggOpen() {
  chime(880);
  setTimeout(() => chime(1100), 200);
  setTimeout(() => chime(1320), 400);
}
