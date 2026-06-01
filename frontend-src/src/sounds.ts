let _ctx: AudioContext | null = null

function ctx(): AudioContext {
  if (!_ctx) _ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  return _ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.35) {
  const ac = ctx()
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)
  gain.gain.setValueAtTime(0.001, ac.currentTime + start)
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + dur + 0.05)
}

function enabled() {
  return localStorage.getItem('fl_sound') !== 'off'
}

export const sounds = {
  correct() {
    if (!enabled()) return
    tone(523, 0,    0.12)
    tone(784, 0.13, 0.22)
  },

  wrong() {
    if (!enabled()) return
    const ac = ctx()
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(220, ac.currentTime)
    osc.frequency.exponentialRampToValueAtTime(110, ac.currentTime + 0.28)
    gain.gain.setValueAtTime(0.15, ac.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3)
    osc.start()
    osc.stop(ac.currentTime + 0.35)
  },

  victory() {
    if (!enabled()) return
    tone(523,  0,    0.18)
    tone(659,  0.17, 0.18)
    tone(784,  0.34, 0.18)
    tone(1047, 0.51, 0.45)
  },
}
