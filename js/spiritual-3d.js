/**
 * Guhya Gyan - 3D Spiritual Engine & Sacred Geometry Visualizer
 * Implements real-time 3D vector rotation, perspective projection, 
 * 3D card tilt physics, 3D starfield, and 432Hz Vedic harmonic soundscape.
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. True 3D Sacred Geometry Engine (Sri Yantra / Meru Mandala)
     ========================================================================== */

  class Sacred3DMandala {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.width = this.canvas.width = 460;
      this.height = this.canvas.height = 460;
      this.cx = this.width / 2;
      this.cy = this.height / 2;
      this.fov = 340;

      // Angles & Motion
      this.rotX = 0.25;
      this.rotY = 0;
      this.rotZ = 0;
      this.targetRotX = 0.25;
      this.targetRotY = 0;
      this.speed = 0.007;

      // Mouse tracking
      this.isHovered = false;
      this.mouse = { x: 0, y: 0 };

      // Build Sacred 3D Geometry Vertices & Edges
      this.buildGeometry();

      // Prana particles orbiting the mandala
      this.buildPranaParticles();

      this.initEvents();
      this.animate();
    }

    buildGeometry() {
      // 1. Dual Interlocking 3D Tetrahedrons (Merkaba / Star of David / Sri Yantra 3D representation)
      const s = 110;
      this.tetrahedron1 = [
        { x: 0, y: -s * 1.35, z: 0 },
        { x: s * 1.15, y: s * 0.75, z: s * 0.65 },
        { x: -s * 1.15, y: s * 0.75, z: s * 0.65 },
        { x: 0, y: s * 0.75, z: -s * 1.25 }
      ];

      this.tetrahedron2 = [
        { x: 0, y: s * 1.35, z: 0 },
        { x: -s * 1.15, y: -s * 0.75, z: -s * 0.65 },
        { x: s * 1.15, y: -s * 0.75, z: -s * 0.65 },
        { x: 0, y: -s * 0.75, z: s * 1.25 }
      ];

      this.edges1 = [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1]
      ];

      this.edges2 = [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1]
      ];

      // 2. Concentric Sacred Astadala (8-fold lotus) Rings in 3D
      this.rings = [];
      const ringRadii = [80, 140, 190];
      const ringTilts = [0, 0.45, -0.45];

      ringRadii.forEach((r, idx) => {
        const points = [];
        const segments = 24;
        for (let i = 0; i < segments; i++) {
          const theta = (i / segments) * Math.PI * 2;
          points.push({
            x: Math.cos(theta) * r,
            y: Math.sin(theta) * r * Math.cos(ringTilts[idx]),
            z: Math.sin(theta) * r * Math.sin(ringTilts[idx])
          });
        }
        this.rings.push(points);
      });
    }

    buildPranaParticles() {
      this.particles = [];
      const numParticles = 65;
      for (let i = 0; i < numParticles; i++) {
        const radius = Math.random() * 190 + 30;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        this.particles.push({
          x: radius * Math.cos(theta) * Math.cos(phi),
          y: radius * Math.sin(theta) * Math.cos(phi),
          z: radius * Math.sin(phi),
          size: Math.random() * 2.2 + 0.8,
          speed: (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
          alpha: Math.random() * 0.7 + 0.3,
          glow: Math.random() > 0.4 ? '#fbe69b' : '#e6b747'
        });
      }
    }

    initEvents() {
      const container = this.canvas.parentElement || this.canvas;

      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - (rect.left + rect.width / 2);
        const mouseY = e.clientY - (rect.top + rect.height / 2);

        // Responsive tilt based on mouse distance
        this.targetRotY = (mouseX / window.innerWidth) * 1.5;
        this.targetRotX = 0.25 - (mouseY / window.innerHeight) * 1.2;
      });

      // Mobile Touch Interaction
      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          const rect = this.canvas.getBoundingClientRect();
          this.targetRotY = ((touch.clientX - rect.left - rect.width / 2) / rect.width) * 2;
          this.targetRotX = 0.25 - ((touch.clientY - rect.top - rect.height / 2) / rect.height) * 2;
        }
      }, { passive: true });
    }

    // 3D Rotation Math
    rotatePoint(p, rx, ry, rz) {
      // Rotate around X
      let y1 = p.y * Math.cos(rx) - p.z * Math.sin(rx);
      let z1 = p.y * Math.sin(rx) + p.z * Math.cos(rx);

      // Rotate around Y
      let x2 = p.x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -p.x * Math.sin(ry) + z1 * Math.cos(ry);

      // Rotate around Z
      let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);

      return { x: x3, y: y3, z: z2 };
    }

    // Perspective Projection from 3D to 2D
    project(p) {
      const scale = this.fov / (this.fov + p.z);
      return {
        x: this.cx + p.x * scale,
        y: this.cy + p.y * scale,
        scale: scale,
        z: p.z
      };
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Gentle continuous rotation
      this.rotY += this.speed;
      this.rotZ += this.speed * 0.4;

      // Smooth lerp to mouse tilt
      this.rotX += (this.targetRotX - this.rotX) * 0.05;
      const effectiveRotY = this.rotY + this.targetRotY;

      // 1. Draw Central Golden Aura (Bindu Glow)
      const glowGrad = this.ctx.createRadialGradient(this.cx, this.cy, 5, this.cx, this.cy, 180);
      glowGrad.addColorStop(0, 'rgba(250, 215, 110, 0.45)');
      glowGrad.addColorStop(0.35, 'rgba(230, 183, 71, 0.18)');
      glowGrad.addColorStop(0.7, 'rgba(138, 92, 246, 0.06)');
      glowGrad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = glowGrad;
      this.ctx.fillRect(0, 0, this.width, this.height);

      // 2. Render Concentric 3D Rings
      this.rings.forEach((ring, ringIdx) => {
        this.ctx.beginPath();
        const projectedRing = ring.map(p => this.project(this.rotatePoint(p, this.rotX, effectiveRotY, this.rotZ)));
        
        projectedRing.forEach((p, idx) => {
          if (idx === 0) this.ctx.moveTo(p.x, p.y);
          else this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.closePath();
        
        this.ctx.strokeStyle = ringIdx === 1 ? 'rgba(230, 183, 71, 0.55)' : 'rgba(230, 183, 71, 0.28)';
        this.ctx.lineWidth = ringIdx === 1 ? 1.5 : 1;
        this.ctx.stroke();

        // Little sacred nodes on the outer ring
        if (ringIdx === 1) {
          for (let i = 0; i < projectedRing.length; i += 3) {
            const node = projectedRing[i];
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, 2.5 * node.scale, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fbe69b';
            this.ctx.shadowColor = '#e6b747';
            this.ctx.shadowBlur = 8;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
          }
        }
      });

      // 3. Render 3D Sacred Geometry Polyhedrons
      this.renderPolyhedron(this.tetrahedron1, this.edges1, effectiveRotY, 'rgba(250, 215, 110, 0.75)', 1.75);
      this.renderPolyhedron(this.tetrahedron2, this.edges2, effectiveRotY, 'rgba(230, 183, 71, 0.65)', 1.5);

      // 4. Render Orbiting 3D Prana Particles
      this.renderPrana(effectiveRotY);

      // 5. Central Radiant Bindu (The Source of Consciousness)
      const binduPulse = Math.sin(Date.now() * 0.003) * 2 + 5;
      this.ctx.beginPath();
      this.ctx.arc(this.cx, this.cy, binduPulse, 0, Math.PI * 2);
      this.ctx.fillStyle = '#fff';
      this.ctx.shadowColor = '#f5c542';
      this.ctx.shadowBlur = 18;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    renderPolyhedron(vertices, edges, rotY, strokeColor, lineWidth) {
      const proj = vertices.map(v => this.project(this.rotatePoint(v, this.rotX, rotY, this.rotZ)));

      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.shadowColor = 'rgba(230, 183, 71, 0.6)';
      this.ctx.shadowBlur = 6;

      edges.forEach(([i, j]) => {
        this.ctx.beginPath();
        this.ctx.moveTo(proj[i].x, proj[i].y);
        this.ctx.lineTo(proj[j].x, proj[j].y);
        this.ctx.stroke();
      });

      // Draw vertices
      proj.forEach(p => {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 3 * p.scale, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
      });

      this.ctx.shadowBlur = 0;
    }

    renderPrana(rotY) {
      this.particles.forEach(p => {
        // Orbit particle around Y
        p.x = p.x * Math.cos(p.speed) - p.z * Math.sin(p.speed);
        p.z = p.x * Math.sin(p.speed) + p.z * Math.cos(p.speed);

        const rotated = this.rotatePoint(p, this.rotX, rotY, this.rotZ);
        const projected = this.project(rotated);

        this.ctx.beginPath();
        this.ctx.arc(projected.x, projected.y, p.size * projected.scale, 0, Math.PI * 2);
        this.ctx.fillStyle = p.glow;
        this.ctx.globalAlpha = p.alpha * projected.scale;
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
      });
    }

    animate() {
      this.render();
      requestAnimationFrame(() => this.animate());
    }
  }

  /* ==========================================================================
     2. 3D Cosmic Starfield & Nebula Depth Engine (#celestial-canvas)
     ========================================================================== */

  class Cosmic3DStarfield {
    constructor() {
      this.canvas = document.getElementById('celestial-canvas');
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext('2d');
      this.resize();

      this.numStars = Math.min(200, Math.floor((this.width * this.height) / 8000));
      this.stars = [];
      this.fov = 400;

      for (let i = 0; i < this.numStars; i++) {
        this.stars.push({
          x: (Math.random() - 0.5) * this.width * 1.8,
          y: (Math.random() - 0.5) * this.height * 1.8,
          z: Math.random() * 800 + 10,
          baseSize: Math.random() * 1.8 + 0.6,
          color: Math.random() > 0.4 ? '#fbe69b' : (Math.random() > 0.5 ? '#c084fc' : '#67e8f9'),
          speed: Math.random() * 0.4 + 0.15
        });
      }

      window.addEventListener('resize', () => this.resize());
      this.animate();
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
      this.cx = this.width / 2;
      this.cy = this.height / 2;
    }

    animate() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let s of this.stars) {
        s.z -= s.speed;
        if (s.z <= 0) {
          s.z = 800;
          s.x = (Math.random() - 0.5) * this.width * 1.8;
          s.y = (Math.random() - 0.5) * this.height * 1.8;
        }

        const scale = this.fov / (this.fov + s.z);
        const px = this.cx + s.x * scale;
        const py = this.cy + s.y * scale;

        if (px >= 0 && px <= this.width && py >= 0 && py <= this.height) {
          const radius = s.baseSize * scale;
          const alpha = Math.min(1, (1 - s.z / 800) * 1.2);

          this.ctx.beginPath();
          this.ctx.arc(px, py, radius, 0, Math.PI * 2);
          this.ctx.fillStyle = s.color;
          this.ctx.globalAlpha = alpha;
          this.ctx.fill();
        }
      }

      this.ctx.globalAlpha = 1;
      requestAnimationFrame(() => this.animate());
    }
  }

  /* ==========================================================================
     3. 3D Card Tilt Physics (Perspective Parallax with Specular Glare)
     ========================================================================== */

  function init3DCardTilt() {
    const cards = document.querySelectorAll(
      '.realm-card, .speaker-profile-hero, .hero-stats-bar, .feature-card, .sadhana-card, .speaker-portrait-wrap, .sutra-oracle-box, #daily-sutra-box'
    );

    cards.forEach((card) => {
      let isHovering = false;

      // Inject 3D Specular Light Overlay
      let glare = card.querySelector('.card-3d-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'card-3d-glare';
        card.appendChild(glare);
      }

      card.addEventListener('mouseenter', () => {
        isHovering = true;
        card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease';
      });

      card.addEventListener('mousemove', (e) => {
        if (!isHovering) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9; // Max 9 deg tilt
        const rotateY = ((x - centerX) / centerX) * 9;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        // Update Specular Glare
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(230, 183, 71, 0.22) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 75%)`;
        glare.style.opacity = '1';
      });

      card.addEventListener('mouseleave', () => {
        isHovering = false;
        card.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        glare.style.opacity = '0';
      });
    });
  }

  /* ==========================================================================
     4. Vedic 432Hz Ambient Soundscape Synthesizer (Web Audio API)
     ========================================================================== */

  class VedicAudioSanctuary {
    constructor() {
      this.ctx = null;
      this.isPlaying = false;
      this.oscillators = [];
      this.masterGain = null;

      this.initWidget();
    }

    initWidget() {
      const dock = document.getElementById('spiritual-sound-dock');
      const toggleBtn = document.getElementById('sound-dock-toggle');
      const stateLabel = document.getElementById('sound-dock-state');

      if (!toggleBtn) return;

      toggleBtn.addEventListener('click', () => {
        if (!this.isPlaying) {
          this.startSound();
          toggleBtn.classList.add('is-playing');
          if (stateLabel) stateLabel.textContent = 'Playing 432Hz';
          window.showToast?.('ॐ 432Hz Vedic Cosmic Drone Reverberating in Peace...', 'success');
        } else {
          this.stopSound();
          toggleBtn.classList.remove('is-playing');
          if (stateLabel) stateLabel.textContent = 'Play 432Hz';
          window.showToast?.('Sound paused. Resting in silent awareness.', 'info');
        }
      });
    }

    startSound() {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!this.ctx) {
          this.ctx = new AudioContext();
        }

        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3); // Smooth fade in
        this.masterGain.connect(this.ctx.destination);

        // Harmonic Frequency Palette:
        // 432Hz (Cosmic Tuning), 216Hz (Sub), 108Hz (Sacred Vedic Root), 864Hz (Overtone)
        const frequencies = [
          { f: 108.0, type: 'sine', gain: 0.4 },
          { f: 216.0, type: 'sine', gain: 0.3 },
          { f: 432.0, type: 'triangle', gain: 0.25 },
          { f: 436.0, type: 'sine', gain: 0.15 }, // 4Hz binaural theta wave beat
          { f: 648.0, type: 'sine', gain: 0.08 }
        ];

        this.oscillators = frequencies.map(({ f, type, gain }) => {
          const osc = this.ctx.createOscillator();
          const oscGain = this.ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(f, this.ctx.currentTime);

          oscGain.gain.setValueAtTime(gain, this.ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(this.masterGain);

          osc.start();
          return osc;
        });

        this.isPlaying = true;
      } catch (err) {
        console.warn('Audio sanctuary note:', err);
      }
    }

    stopSound() {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
        setTimeout(() => {
          this.oscillators.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) {}
          });
          this.oscillators = [];
          this.isPlaying = false;
        }, 1600);
      } else {
        this.isPlaying = false;
      }
    }
  }

  /* ==========================================================================
     Bootstrap Spiritual 3D Engine
     ========================================================================== */

  function initSpiritualEngine() {
    // 1. Launch 3D Sacred Geometry Mandala
    if (document.getElementById('mandala-3d-canvas')) {
      new Sacred3DMandala('mandala-3d-canvas');
    }

    // 2. Launch 3D Cosmic Starfield
    if (document.getElementById('celestial-canvas')) {
      new Cosmic3DStarfield();
    }

    // 3. Launch 3D Card Tilt Physics
    init3DCardTilt();

    // 4. Launch 432Hz Vedic Audio Sanctuary
    window.vedicAudio = new VedicAudioSanctuary();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpiritualEngine);
  } else {
    initSpiritualEngine();
  }

})();
