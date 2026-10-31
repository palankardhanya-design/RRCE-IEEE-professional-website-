/* ════════════════════════════════════════════════════════════════
   IEEE RRCE — Vanilla JavaScript
   RajaRajeswari College of Engineering, Bengaluru
════════════════════════════════════════════════════════════════ */
'use strict';

/* ── REDUCED MOTION CHECK ────────────────────────────────────── */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ══════════════════════════════════════════════════════════════
   1. NAVIGATION
══════════════════════════════════════════════════════════════ */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
const navLinks  = navMenu ? navMenu.querySelectorAll('.nav-link') : [];
const bars      = navToggle ? navToggle.querySelectorAll('.toggle-bar') : [];

/* Scroll: add .scrolled */
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveLink();
  toggleBackToTop();
}, { passive: true });

/* Mobile toggle */
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    bars.forEach((b, i) => b.classList.toggle(`open-${i}`, isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

/* Close menu on link click */
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle && navToggle.setAttribute('aria-expanded', 'false');
    bars.forEach((b, i) => b.classList.remove(`open-${i}`));
    document.body.style.overflow = '';
  });
});

/* Active nav link on scroll */
const sections = document.querySelectorAll('section[id]');
function updateActiveLink() {
  const scrollY = window.scrollY + 120;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const h   = sec.offsetHeight;
    const id  = sec.getAttribute('id');
    const link = navMenu.querySelector(`a[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + h);
  });
}

/* ══════════════════════════════════════════════════════════════
   2. HERO CANVAS — PARTICLE FIELD
══════════════════════════════════════════════════════════════ */
(function initHeroParticles() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animFrame;
  const COUNT = prefersReduced ? 0 : 90;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.r  = Math.random() * 1.8 + 0.4;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.a  = 0;
      this.ta = Math.random() * 0.5 + 0.1;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      this.x  += this.vx;
      this.y  += this.vy;
      this.life++;
      const p = this.life / this.maxLife;
      this.a = p < 0.15 ? p / 0.15 * this.ta
             : p > 0.75 ? (1 - p) / 0.25 * this.ta
             : this.ta;
      if (this.life > this.maxLife) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(183,197,214,${this.a})`;
      ctx.fill();
    }
  }

  /* Connection lines */
  function drawConnections() {
    const maxDist = 100;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * 0.06;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(20,86,160,${a})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    loop();
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    if (!prefersReduced) drawConnections();
    animFrame = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
})();

/* ══════════════════════════════════════════════════════════════
   3. 3D HERO OBJECT — MOUSE PARALLAX
══════════════════════════════════════════════════════════════ */
(function init3DHero() {
  const wrap   = document.getElementById('hero3dWrap');
  const obj    = document.getElementById('objWrapper');
  if (!wrap || !obj || prefersReduced) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = (e.clientY - cy) / cy * -14;
    targetY = (e.clientX - cx) / cx *  14;
  }, { passive: true });

  /* Touch support */
  document.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    targetX = (t.clientY - cy) / cy * -10;
    targetY = (t.clientX - cx) / cx *  10;
  }, { passive: true });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tick() {
    curX = lerp(curX, targetX, 0.06);
    curY = lerp(curY, targetY, 0.06);
    obj.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`;
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ══════════════════════════════════════════════════════════════
   4. JOIN SECTION CANVAS — RADIAL PARTICLES
══════════════════════════════════════════════════════════════ */
(function initJoinCanvas() {
  const canvas = document.getElementById('joinCanvas');
  if (!canvas || prefersReduced) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  const orbs = Array.from({ length: 5 }, (_, i) => ({
    angle: (i / 5) * Math.PI * 2,
    r: 180 + i * 30,
    speed: 0.003 + i * 0.001,
    size: 2 + i * 0.5,
    a: 0.3 + i * 0.05
  }));

  function loop() {
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    orbs.forEach(o => {
      o.angle += o.speed;
      const x = cx + Math.cos(o.angle) * o.r;
      const y = cy + Math.sin(o.angle) * o.r;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 60);
      g.addColorStop(0, `rgba(20,86,160,${o.a})`);
      g.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, 60, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, o.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(183,197,214,${o.a * 2})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  loop();
})();

/* ══════════════════════════════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════════════════════════════ */
(function initReveal() {
  if (prefersReduced) {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════════
   6. CARD TILT EFFECT
══════════════════════════════════════════════════════════════ */
(function initCardTilt() {
  if (prefersReduced) return;
  const cards = document.querySelectorAll('.community-card,.event-card,.ach-card,.leader-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width  / 2;
      const cy = rect.height / 2;
      const rx = (y - cy) / cy * -5;
      const ry = (x - cx) / cx *  5;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════════════════════════════════
   7. SMOOTH SCROLL FOR NAV / CTA LINKS
══════════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
});

/* ══════════════════════════════════════════════════════════════
   8. BACK TO TOP
══════════════════════════════════════════════════════════════ */
const backToTopBtn = document.getElementById('backToTop');
function toggleBackToTop() {
  if (backToTopBtn) backToTopBtn.classList.toggle('visible', window.scrollY > 400);
}
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════════════════════════════
   9. CONTACT FORM
══════════════════════════════════════════════════════════════ */
const contactForm = document.getElementById('contactForm');
const formMsg     = document.getElementById('formMsg');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const fname   = document.getElementById('fname').value.trim();
    const email   = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value.trim();

    if (!fname || !email || !subject || !message) {
      formMsg.textContent = 'Please fill in all required fields.';
      formMsg.style.color = '#b91c1c';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formMsg.textContent = 'Please enter a valid email address.';
      formMsg.style.color = '#b91c1c';
      return;
    }

    const btn = contactForm.querySelector('.btn-submit');
    btn.style.opacity = '0.7';
    btn.disabled = true;
    setTimeout(() => {
      formMsg.textContent = '✓ Message received! We\'ll get back to you soon.';
      formMsg.style.color = '#047857';
      contactForm.reset();
      btn.style.opacity = '';
      btn.disabled = false;
      setTimeout(() => { formMsg.textContent = ''; }, 5000);
    }, 1200);
  });
}

/* ══════════════════════════════════════════════════════════════
   10. PARALLAX — HERO GRID OVERLAY
══════════════════════════════════════════════════════════════ */
(function initParallax() {
  if (prefersReduced) return;
  const gridOverlay = document.querySelector('.hero-grid-overlay');
  if (!gridOverlay) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    gridOverlay.style.transform = `translateY(${y * 0.25}px)`;
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════
   11. GALLERY KEYBOARD NAVIGATION
══════════════════════════════════════════════════════════════ */
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   12. INITIAL ACTIVE LINK
══════════════════════════════════════════════════════════════ */
updateActiveLink();
toggleBackToTop();

/* ══════════════════════════════════════════════════════════════
   13. NAVBAR: force scrolled class after initial render
══════════════════════════════════════════════════════════════ */
if (window.scrollY > 40) navbar.classList.add('scrolled');
