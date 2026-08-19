// ============================================
// SPLASH SCREEN — 5 SECONDS | 3D CUBE + PARTICLES
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
    constructor() {
      this.reset();
    }
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
      if (this.x < 0 || this.x > w) { this.speedX *= -1; }
      if (this.y < 0 || this.y > h) { this.speedY *= -1; }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198, 166, 100, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < count; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    // Draw connecting lines
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
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ========== SPLASH LOGIC ==========
function exitSplash() {
  splash.classList.add('exit');
  document.body.classList.remove('locked');
  sessionStorage.setItem('za_splash_shown', '1');
  setTimeout(() => splash.remove(), 900);
}

if (!splash) {
  // no splash element
} else if (alreadyVisited || reduceMotionQuery.matches) {
  splash.remove();
  document.body.classList.remove('locked');
} else {
  document.body.classList.add('locked');
  initParticles();

  const SPLASH_DURATION = 5000; // 5 SECONDS — DOMINATING
  const start = performance.now();
  let pageLoaded = false;

  window.addEventListener('load', () => { pageLoaded = true; });

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / SPLASH_DURATION, 1);
    
    // Use easing for a smooth feel
    const eased = 1 - Math.pow(1 - progress, 3);
    const displayPct = Math.round(eased * 100);
    
    splashCounter.textContent = displayPct;
    splashBarFill.style.width = displayPct + '%';

    if (progress >= 1 && pageLoaded) {
      setTimeout(exitSplash, 300);
    } else if (progress >= 1 && !pageLoaded) {
      // Hold at 99% until page loads
      splashCounter.textContent = '99';
      splashBarFill.style.width = '99%';
      // Keep checking
      if (!pageLoaded) {
        window.addEventListener('load', () => {
          setTimeout(exitSplash, 200);
        });
      }
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

  document.querySelectorAll('a, button, .tilt, .drop').forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('grow'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('grow'));
  });
}

// ============================================
// HERO PARALLAX
// ============================================
const heroBg = document.querySelector('.hero-bg');
const heroSection = document.querySelector('.hero');

if (heroBg && heroSection) {
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    heroBg.style.setProperty('--px', (relX * 40) + 'px');
    heroBg.style.setProperty('--py', (relY * 40) + 'px');
  });
}

// ============================================
// 3D TILT ON CARDS — Enhanced
// ============================================
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    const tiltX = relY * -12;
    const tiltY = relX * 12;
    card.style.setProperty('--rx', tiltX + 'deg');
    card.style.setProperty('--ry', tiltY + 'deg');
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
// SCROLL REVEALS — with 3D perspective
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
// MAGNETIC BUTTONS — with 3D depth
// ============================================
const magnets = document.querySelectorAll('.magnetic');

magnets.forEach(btn => {
  const strength = 20;

  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x*x + y*y);
    const maxDist = Math.max(rect.width, rect.height) / 2;
    const intensity = Math.min(1, dist / maxDist);
    btn.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px) scale(${1 + intensity * 0.02})`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0,0) scale(1)';
  });
});

// ============================================
// RESPECT REDUCED MOTION
// ============================================
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  revealEls.forEach(el => el.classList.add('in-view'));
}

console.log('🚀 Zrar Akbar — Portfolio Dominating');
console.log('📦 3D Splash Screen | 5 Seconds | Particles | Full 3D Touch');