/**
 * GuhyaGyan - Sacred Sound Synthesizer (Web Audio API)
 * Generates an ethereal 432Hz Om drone, binaural theta frequencies, and singing bowl harmonics
 */

class SacredSoundEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.oscillators = [];
    this.baseFreq = 108.0; // Sacred 108Hz harmonic base
    this.binauralDiff = 4.32; // Deep Theta/Alpha trance wave
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.initContext();
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  start() {
    if (this.isPlaying) return;
    this.initContext();
    this.oscillators = [];

    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.35, now + 2.5);

    // Harmonic configuration: Fundamental Om frequency + overtone choir
    const harmonics = [
      { freq: 108, gain: 0.45, type: 'sine' },       // Deep fundamental Drone
      { freq: 216, gain: 0.28, type: 'sine' },       // 1st Octave
      { freq: 432, gain: 0.25, type: 'triangle' },   // Cosmic 432 Hz Tuning
      { freq: 436.32, gain: 0.18, type: 'sine' },    // Binaural Theta beating (4.32Hz diff)
      { freq: 648, gain: 0.12, type: 'sine' },       // Perfect fifth harmonic
      { freq: 864, gain: 0.08, type: 'sine' }        // High singing bowl shimmer
    ];

    harmonics.forEach(h => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = h.type;
      osc.frequency.setValueAtTime(h.freq, now);

      // Add gentle LFO frequency modulation for organic celestial breathing pulse
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, now); // 8-second breathing cycle
      lfoGain.gain.setValueAtTime(1.5, now);
      lfo.connect(osc.frequency);
      lfo.start(now);

      oscGain.gain.setValueAtTime(h.gain, now);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc.start(now);
      this.oscillators.push({ osc, lfo });
    });

    this.isPlaying = true;
    this.updateUI();
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Smooth fade out
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    setTimeout(() => {
      this.oscillators.forEach(o => {
        try {
          o.osc.stop();
          o.lfo.stop();
        } catch (e) {}
      });
      this.oscillators = [];
      this.isPlaying = false;
      this.updateUI();
    }, 1250);
  }

  setVolume(val) {
    if (!this.ctx || !this.masterGain) return;
    const vol = parseFloat(val);
    this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
  }

  updateUI() {
    const playBtn = document.getElementById('sound-toggle-btn');
    const statusText = document.getElementById('sound-status-text');
    const waveVisual = document.getElementById('sound-wave-indicator');

    if (playBtn) {
      if (this.isPlaying) {
        playBtn.classList.add('playing');
        playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          <span>Pauze Resonance</span>
        `;
      } else {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>Play 432Hz Om Drone</span>
        `;
      }
    }

    if (statusText) {
      statusText.textContent = this.isPlaying 
        ? 'Resonating: Sacred 432 Hz Harmonic Om & Theta Binaural Waves'
        : 'Soundscape is silent. Press play to awaken celestial frequencies.';
    }

    if (waveVisual) {
      waveVisual.style.opacity = this.isPlaying ? '1' : '0.25';
      if (this.isPlaying) {
        waveVisual.classList.add('sound-playing');
      } else {
        waveVisual.classList.remove('sound-playing');
      }
    }
  }
}

// Global Sound Engine
window.sacredSoundEngine = new SacredSoundEngine();
