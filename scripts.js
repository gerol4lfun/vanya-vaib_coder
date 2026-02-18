/* =====================================================
   VIBE CODING — INTERACTIONS & ANIMATIONS
   ===================================================== */

// ─── PARTICLE CANVAS BACKGROUND ───────────────────────

(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles;
  let mouse = { x: -9999, y: -9999 };

  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 140;
  const MOUSE_DIST = 180;

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size = Math.random() * 1.5 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
      // Color: purple, cyan, blue
      const hues = [265, 195, 220];
      this.hue = hues[Math.floor(Math.random() * hues.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_DIST) {
        const force = (MOUSE_DIST - dist) / MOUSE_DIST;
        this.x += (dx / dist) * force * 1.5;
        this.y += (dy / dist) * force * 1.5;
      }

      // Wrap edges
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 75%, ${this.alpha})`;
      ctx.fill();
    }
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    if (!particles) {
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  resize();
  animate();
})();


// ─── SCROLL REVEAL ────────────────────────────────────

(function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || 0, 10);
          setTimeout(() => el.classList.add('visible'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


// ─── COUNTER ANIMATION ────────────────────────────────

(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 1800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target;
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


// ─── HERO PARALLAX ────────────────────────────────────

(function initParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const title = hero.querySelector('.hero__title');
        const desc = hero.querySelector('.hero__desc');
        const quote = hero.querySelector('.hero__quote');

        if (title) title.style.transform = `translateY(${scrollY * 0.15}px)`;
        if (desc) desc.style.transform = `translateY(${scrollY * 0.1}px)`;
        if (quote) quote.style.transform = `translateY(${scrollY * 0.08}px)`;

        ticking = false;
      });
      ticking = true;
    }
  });
})();


// ─── TERMINAL TYPEWRITER ──────────────────────────────

(function initTypewriter() {
  const el = document.querySelector('.typewriter-text');
  if (!el) return;

  const text = el.textContent;
  el.textContent = '';
  el.style.animation = 'none';

  let i = 0;
  let direction = 1;
  let timeout;

  function type() {
    if (direction === 1) {
      el.textContent = text.slice(0, i++);
      if (i > text.length) {
        direction = -1;
        timeout = setTimeout(type, 2000);
        return;
      }
    } else {
      el.textContent = text.slice(0, i--);
      if (i < 0) {
        direction = 1;
        i = 0;
        timeout = setTimeout(type, 600);
        return;
      }
    }
    timeout = setTimeout(type, direction === 1 ? 28 : 12);
  }

  // Start after a short delay
  setTimeout(type, 1000);
})();


// ─── SMOOTH HOVER ON STORY CARDS ──────────────────────

(function initCardTilt() {
  document.querySelectorAll('.story-card, .why-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;

      card.style.transform = `translateY(-4px) perspective(600px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


// ─── SECTION PROGRESS GLOW ────────────────────────────

(function initSectionGlow() {
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
        }
      });
    },
    { threshold: 0.05 }
  );

  sections.forEach(s => observer.observe(s));
})();


// ─── COPY CODE FEEL IN TERMINAL ───────────────────────

(function initTerminalPulse() {
  const terminal = document.querySelector('.terminal');
  if (!terminal) return;

  const lines = terminal.querySelectorAll('.terminal__line');

  // Re-animate on scroll into view
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        lines.forEach((line, i) => {
          line.style.opacity = '0';
          line.style.transform = 'translateX(-8px)';
          setTimeout(() => {
            line.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            line.style.opacity = '1';
            line.style.transform = 'translateX(0)';
          }, i * 200 + 200);
        });
        observer.unobserve(entries[0].target);
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(terminal);
})();
