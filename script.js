// ============================================
// SPLASH SCREEN — 3D CUBE + PARTICLES + ROBOT GREETING
// ============================================
const splash = document.getElementById('splash');
const splashCounter = document.getElementById('splashCounter');
const splashBarFill = document.getElementById('splashBarFill');
const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const alreadyVisited = sessionStorage.getItem('za_splash_shown');

// ========== PARTICLE SYSTEM ==========
function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const count = 80;

  function resize() {
    w = canvas.width = canvas.parentElement.offsetWidth;
    h = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > w) this.speedX *= -1;
      if (this.y < 0 || this.y > h) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198, 166, 100, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) particles.push(new Particle());

  let rafId;
  function animateParticles() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => { p.update(); p.draw(); });
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(198, 166, 100, ${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    rafId = requestAnimationFrame(animateParticles);
  }
  animateParticles();

  const stopObserver = new MutationObserver(() => {
    if (!document.body.contains(canvas)) {
      cancelAnimationFrame(rafId);
      stopObserver.disconnect();
    }
  });
  stopObserver.observe(document.body, { childList: true, subtree: true });
}

// ========== SPLASH LOGIC ==========
function exitSplash() {
  splash.classList.add('exit');
  document.body.classList.remove('locked');
  sessionStorage.setItem('za_splash_shown', '1');
  setTimeout(() => splash.remove(), 900);
}

if (!splash) {
  // no splash element on this page
} else if (alreadyVisited || reduceMotionQuery.matches) {
  splash.remove();
  document.body.classList.remove('locked');
} else {
  document.body.classList.add('locked');
  initParticles();

  const splashLabel = document.getElementById('splashLabel');
  const splashMeta = document.getElementById('splashMeta');
  const splashGreeting = document.getElementById('splashGreeting');
  const statusStages = [
    { at: 0, text: 'CALIBRATING SYSTEMS' },
    { at: 30, text: 'LOADING SKILL MODULES' },
    { at: 60, text: 'CONNECTING TO ORBIT' },
    { at: 85, text: 'CLEARED FOR LANDING' }
  ];
  let stageIndex = 0;

  const SPLASH_DURATION = 5000; // 5 seconds
  const start = performance.now();
  let pageLoaded = false;
  let greetingShown = false;

  window.addEventListener('load', () => { pageLoaded = true; });

  // once fully loaded: swap the counter/bar for a brief robot "hi", then exit
  function playGreetingThenExit() {
    if (greetingShown) return;
    greetingShown = true;

    if (splashMeta) splashMeta.classList.add('fade-out');
    if (splashGreeting) {
      setTimeout(() => splashGreeting.classList.add('show'), 200);
    }
    setTimeout(exitSplash, 1400);
  }

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / SPLASH_DURATION, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const displayPct = Math.round(eased * 100);

    splashCounter.textContent = displayPct;
    splashBarFill.style.width = displayPct + '%';

    if (splashLabel && stageIndex < statusStages.length - 1 && displayPct >= statusStages[stageIndex + 1].at) {
      stageIndex++;
      splashLabel.textContent = statusStages[stageIndex].text;
    }

    if (progress >= 1 && pageLoaded) {
      playGreetingThenExit();
    } else if (progress >= 1 && !pageLoaded) {
      splashCounter.textContent = '99';
      splashBarFill.style.width = '99%';
      window.addEventListener('load', () => playGreetingThenExit(), { once: true });
    } else {
      requestAnimationFrame(tick);
    }
  }
  requestAnimationFrame(tick);
}

// ============================================
// CUSTOM CURSOR
// ============================================
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

if (!isTouch) {
  let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
    cursorDot.classList.add('active');
    cursorRing.classList.add('active');
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .tilt, .drop, .cert-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('grow'));
  });
}

// ============================================
// HERO PARALLAX + 3D TILT
// ============================================
const heroBg = document.querySelector('.hero-bg');
const heroSection = document.querySelector('.hero');
const heroInner = document.getElementById('heroInner');

if (heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;

    if (heroBg) {
      heroBg.style.setProperty('--px', (relX * 40) + 'px');
      heroBg.style.setProperty('--py', (relY * 40) + 'px');
    }
    if (heroInner) {
      heroInner.style.transform = `rotateY(${relX * 5}deg) rotateX(${relY * -5}deg)`;
    }
  });
  heroSection.addEventListener('mouseleave', () => {
    if (heroInner) heroInner.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
}

// ============================================
// 3D TILT ON CARDS
// ============================================
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty('--rx', (relY * -12) + 'deg');
    card.style.setProperty('--ry', (relX * 12) + 'deg');
    card.style.setProperty('--tz', '12px');
    card.style.setProperty('--ty', '-8px');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--tz', '0px');
    card.style.setProperty('--ty', '0px');
  });
});

// ============================================
// HERO ROBOT — idle sway + slow-floating skill badges
// ============================================
(function initRobotScene() {
  const scene = document.getElementById('robotScene');
  if (!scene) return;
  const robot = scene.querySelector('.robot-3d');
  const badges = Array.from(scene.querySelectorAll('.skill-badge'));

  if (reduceMotionQuery.matches) return;

  scene.addEventListener('mousemove', (e) => {
    const rect = scene.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    if (robot) {
      robot.style.transform = `rotateY(${relX * 22}deg) rotateX(${relY * -14}deg)`;
    }
  });
  scene.addEventListener('mouseleave', () => {
    if (robot) robot.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });

  badges.forEach((badge, i) => {
    badge.style.animationDelay = `${i * 0.6}s`;
  });
})();

// ============================================
// PERSISTENT BACKGROUND — starfield, planets, spaceship
// ============================================
// The ship stays roughly fixed on screen (like a cockpit view);
// motion through space comes from planets and stars drifting past
// it at different scroll-linked depths — the same trick side-scrolling
// space games use to fake forward motion without moving the "camera".
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, docH, stars = [], planets = [];

  const planetConfig = [
    { color: '198,166,100', radiusFrac: 0.09, xFrac: 0.12, docFrac: 0.06, depth: 0.35 },
    { color: '166,58,52',   radiusFrac: 0.13, xFrac: 0.88, docFrac: 0.22, depth: 0.55 },
    { color: '76,124,106',  radiusFrac: 0.07, xFrac: 0.5,  docFrac: 0.42, depth: 0.25 },
    { color: '122,107,201', radiusFrac: 0.1,  xFrac: 0.2,  docFrac: 0.62, depth: 0.5 },
    { color: '198,166,100', radiusFrac: 0.08, xFrac: 0.85, docFrac: 0.82, depth: 0.4 }
  ];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    docH = document.documentElement.scrollHeight;

    const count = Math.floor((w * h) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.3 + 0.3,
      baseOpacity: Math.random() * 0.5 + 0.15,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2
    }));

    planets = planetConfig.map(p => ({
      ...p,
      x: p.xFrac * w,
      radius: p.radiusFrac * Math.min(w, h) + 40,
      anchorY: p.docFrac * docH
    }));
  }
  resize();
  window.addEventListener('resize', resize);

  const bgColor = '#0B0B0C';
  let t = 0;
  let lastScrollY = window.scrollY;
  let shipTilt = 0; // smoothed rotation based on scroll direction

  function drawPlanets() {
    const scrollY = window.scrollY;
    planets.forEach((p, i) => {
      const screenY = (p.anchorY - scrollY) * p.depth + h * 0.5 * (1 - p.depth);
      if (screenY < -p.radius * 1.5 || screenY > h + p.radius * 1.5) return;

      const gradient = ctx.createRadialGradient(p.x, screenY, 0, p.x, screenY, p.radius);
      gradient.addColorStop(0, `rgba(${p.color}, 0.32)`);
      gradient.addColorStop(0.55, `rgba(${p.color}, 0.14)`);
      gradient.addColorStop(1, `rgba(${p.color}, 0)`);
      ctx.beginPath();
      ctx.arc(p.x, screenY, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      if (i === 1) {
        ctx.save();
        ctx.translate(p.x, screenY);
        ctx.rotate(-0.35);
        ctx.scale(1, 0.32);
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${p.color}, 0.25)`;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();
      }
    });
  }

  // -- the spaceship: bigger, drawn in the background, stays roughly
  // fixed on screen while the world scrolls past it --
  function drawShip(velocity) {
    const shipX = w * 0.8;
    const shipY = h * 0.32 + Math.sin(t * 0.02) * 10; // gentle idle bob
    const size = Math.min(w, h) * 0.11 + 60; // bigger presence than the old satellite

    // smooth the tilt toward the target so direction changes don't snap
    const targetTilt = Math.max(-0.22, Math.min(0.22, velocity * 0.01));
    shipTilt += (targetTilt - shipTilt) * 0.08;

    ctx.save();
    ctx.translate(shipX, shipY);
    ctx.rotate(shipTilt);

    // engine glow / trail behind the ship
    const trailLength = size * (1.1 + Math.min(Math.abs(velocity) * 0.02, 0.8));
    const trailGradient = ctx.createLinearGradient(-trailLength, 0, -size * 0.3, 0);
    trailGradient.addColorStop(0, 'rgba(198,166,100,0)');
    trailGradient.addColorStop(1, 'rgba(198,166,100,0.55)');
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.12);
    ctx.lineTo(-trailLength, 0);
    ctx.lineTo(-size * 0.3, size * 0.12);
    ctx.closePath();
    ctx.fillStyle = trailGradient;
    ctx.fill();

    // hull
    ctx.beginPath();
    ctx.moveTo(size * 0.55, 0);
    ctx.quadraticCurveTo(size * 0.1, -size * 0.22, -size * 0.35, -size * 0.14);
    ctx.quadraticCurveTo(-size * 0.5, 0, -size * 0.35, size * 0.14);
    ctx.quadraticCurveTo(size * 0.1, size * 0.22, size * 0.55, 0);
    ctx.closePath();
    const hullGradient = ctx.createLinearGradient(-size * 0.3, 0, size * 0.5, 0);
    hullGradient.addColorStop(0, 'rgba(142,138,128,0.9)');
    hullGradient.addColorStop(1, 'rgba(243,239,231,0.95)');
    ctx.fillStyle = hullGradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(198,166,100,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // wings
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.1);
    ctx.lineTo(-size * 0.35, -size * 0.42);
    ctx.lineTo(size * 0.05, -size * 0.16);
    ctx.closePath();
    ctx.moveTo(-size * 0.1, size * 0.1);
    ctx.lineTo(-size * 0.35, size * 0.42);
    ctx.lineTo(size * 0.05, size * 0.16);
    ctx.closePath();
    ctx.fillStyle = 'rgba(166,58,52,0.75)';
    ctx.fill();

    // cockpit glow
    ctx.beginPath();
    ctx.arc(size * 0.18, 0, size * 0.09, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(143,216,232,0.85)';
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    drawPlanets();
    t += 1;

    const currentScrollY = window.scrollY;
    const velocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    drawShip(velocity);

    const streak = Math.max(0, Math.min(Math.abs(velocity) * 1.4, 26));
    const dir = velocity > 0 ? 1 : -1;

    stars.forEach(s => {
      const twinkle = Math.sin(t * s.twinkleSpeed + s.phase) * 0.35 + 0.65;
      const alpha = s.baseOpacity * twinkle;
      if (streak > 3) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y - dir * streak * (0.4 + s.r * 0.4));
        ctx.strokeStyle = `rgba(243, 239, 231, ${alpha})`;
        ctx.lineWidth = s.r;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 239, 231, ${alpha})`;
        ctx.fill();
      }
    });
    requestAnimationFrame(draw);
  }

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw();
  } else {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    drawPlanets();
    drawShip(0);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(243, 239, 231, ${s.baseOpacity})`;
      ctx.fill();
    });
  }
})();

// ============================================
// SCROLL-DRIVEN 3D DEPTH — hero only.
// Content sections stay flat and stable; the space-travel
// feeling lives entirely in the starfield/planet/ship background.
// ============================================
const heroEl = document.querySelector('.hero');
let scrollTicking = false;

function applyScroll3D() {
  const scrollY = window.scrollY;

  if (heroEl) {
    const heroHeight = heroEl.offsetHeight || window.innerHeight;
    const progress = Math.min(scrollY / heroHeight, 1);
    heroEl.style.transform = `rotateX(${progress * 20}deg) translateY(${progress * 100}px) scale(${1 - progress * 0.16})`;
    heroEl.style.opacity = 1 - progress * 0.85;
    heroEl.style.filter = `blur(${progress * 4}px)`;
  }

  scrollTicking = false;
}

if (!reduceMotionQuery.matches) {
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(applyScroll3D);
      scrollTicking = true;
    }
  }, { passive: true });
  applyScroll3D();
}

// ============================================
// NAVBAR SCROLL STATE
// ============================================
const navbar = document.getElementById('navbar');
const progressFill = document.getElementById('progressFill');
const timelineFill = document.getElementById('timelineFill');
const timeline = document.querySelector('.timeline');

function onScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 24);

  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressFill.style.width = pct + '%';

  if (timeline) {
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const start = vh * 0.85;
    const total = rect.height + vh * 0.4;
    let filled = start - rect.top;
    filled = Math.max(0, Math.min(filled, total));
    const fillPct = total > 0 ? (filled / total) * 100 : 0;
    if (timelineFill) timelineFill.style.height = fillPct + '%';
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ============================================
// MOBILE NAV TOGGLE
// ============================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============================================
// SCROLL REVEALS
// ============================================
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ============================================
// MAGNETIC BUTTONS
// ============================================
document.querySelectorAll('.magnetic').forEach(btn => {
  const strength = 20;
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x * x + y * y);
    const maxDist = Math.max(rect.width, rect.height) / 2;
    const intensity = Math.min(1, dist / maxDist);
    btn.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px) scale(${1 + intensity * 0.02})`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'translate(0,0) scale(1)'; });
});

// ============================================
// CONTACT FORM — real submission via Formspree
// ============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    const btn = contactForm.querySelector('.form-submit');
    const btnLabel = btn.querySelector('span');
    const originalLabel = btnLabel.textContent;

    // honeypot — bots fill every field, humans never see this one
    const honeypot = contactForm.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    // FIX: this used to check for the literal string of a real form ID
    // (a copy-paste leftover), which meant it matched EVERY submission
    // and blocked the form permanently. It now only checks for the
    // actual placeholder text, which your real ID will never contain.
    if (contactForm.action.includes('YOUR_FORM_ID')) {
      status.textContent = 'Form isn\'t connected yet — replace YOUR_FORM_ID in index.html with your real Formspree endpoint.';
      status.className = 'form-status error';
      return;
    }

    if (location.protocol === 'file:') {
      status.textContent = 'This page is open as a local file — the form only works once it\'s hosted on a real URL (e.g. Netlify).';
      status.className = 'form-status error';
      return;
    }

    btn.disabled = true;
    btnLabel.textContent = 'Sending…';
    status.textContent = '';
    status.className = 'form-status';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        status.textContent = "Thanks — your message is on its way. I'll reply by email soon.";
        status.className = 'form-status success';
        contactForm.reset();
      } else if (res.status === 422) {
        status.textContent = "Formspree rejected that submission — check every field is filled in correctly.";
        status.className = 'form-status error';
      } else if (res.status === 403) {
        status.textContent = "This form hasn't been confirmed yet — check your inbox for a one-time Formspree confirmation email and click it, then try again.";
        status.className = 'form-status error';
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('Formspree error', res.status, data);
        throw new Error(data?.errors?.[0]?.message || `Server responded with ${res.status}`);
      }
    } catch (err) {
      console.error('Contact form submission failed:', err);
      status.textContent = "Couldn't send that — please try again in a moment or email me directly below.";
      status.className = 'form-status error';
    } finally {
      btn.disabled = false;
      btnLabel.textContent = originalLabel;
    }
  });
}

// ============================================
// RESPECT REDUCED MOTION
// ============================================
if (reduceMotionQuery.matches) {
  revealEls.forEach(el => el.classList.add('in-view'));
}
