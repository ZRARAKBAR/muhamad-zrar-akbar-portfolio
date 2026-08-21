/* =========================================================
   ZRAR AKBAR — PORTFOLIO ENGINE
========================================================= */

"use strict";


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];


/* =========================================================
   BODY LOADING
========================================================= */

document.body.classList.add("loading");


/* =========================================================
   SPLASH SCREEN
========================================================= */

const splash = $("#splash");
const splashCounter = $("#splashCounter");
const splashBarFill = $("#splashBarFill");

let splashProgress = 0;

const splashTimer = setInterval(() => {

  splashProgress += Math.floor(Math.random() * 8) + 2;

  if (splashProgress >= 100) {
    splashProgress = 100;
    clearInterval(splashTimer);

    setTimeout(() => {

      splash.classList.add("is-hidden");
      document.body.classList.remove("loading");

      revealHero();

    }, 450);
  }

  if (splashCounter) {
    splashCounter.textContent = splashProgress;
  }

  if (splashBarFill) {
    splashBarFill.style.width = `${splashProgress}%`;
  }

}, 65);


/* =========================================================
   PARTICLE CANVAS
========================================================= */

const canvas = $("#particleCanvas");

if (canvas) {

  const ctx = canvas.getContext("2d");

  let particles = [];
  let width = 0;
  let height = 0;

  function resizeCanvas() {

    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

  }

  function createParticles() {

    particles = [];

    const amount = Math.min(
      140,
      Math.floor((width * height) / 11000)
    );

    for (let i = 0; i < amount; i++) {

      particles.push({

        x: Math.random() * width,
        y: Math.random() * height,

        radius: Math.random() * 1.5 + 0.3,

        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,

        opacity: Math.random() * 0.6 + 0.15

      });

    }

  }

  function drawParticles() {

    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {

      particle.x += particle.speedX;
      particle.y += particle.speedY;

      if (particle.x < 0) particle.x = width;
      if (particle.x > width) particle.x = 0;

      if (particle.y < 0) particle.y = height;
      if (particle.y > height) particle.y = 0;

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(255,255,255,${particle.opacity})`;

      ctx.fill();

    });

    requestAnimationFrame(drawParticles);

  }

  resizeCanvas();
  createParticles();
  drawParticles();

  window.addEventListener("resize", () => {

    resizeCanvas();
    createParticles();

  });

}


/* =========================================================
   HERO REVEAL
========================================================= */

function revealHero() {

  $$(".hero .reveal-up").forEach((element) => {
    element.classList.add("visible");
  });

}


/* =========================================================
   INTERSECTION REVEALS
========================================================= */

const revealObserver = new IntersectionObserver(
  (entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {

        entry.target.classList.add("visible");

        revealObserver.unobserve(entry.target);

      }

    });

  },
  {
    threshold: 0.12
  }
);

$$(".reveal").forEach((element) => {
  revealObserver.observe(element);
});


/* =========================================================
   NAVIGATION
========================================================= */

const navToggle = $("#navToggle");
const navLinks = $("#navLinks");

if (navToggle && navLinks) {

  navToggle.addEventListener("click", () => {

    const isOpen =
      navLinks.classList.toggle("open");

    navToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  });


  $$("#navLinks a").forEach((link) => {

    link.addEventListener("click", () => {

      navLinks.classList.remove("open");

      navToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    });

  });

}


/* =========================================================
   SCROLL PROGRESS
========================================================= */

const progressFill = $("#progressFill");

function updateScrollProgress() {

  const scrollTop = window.scrollY;

  const maxScroll =
    document.documentElement.scrollHeight -
    window.innerHeight;

  const progress =
    maxScroll > 0
      ? scrollTop / maxScroll
      : 0;

  if (progressFill) {
    progressFill.style.width =
      `${progress * 100}%`;
  }

}

window.addEventListener(
  "scroll",
  updateScrollProgress,
  { passive: true }
);

updateScrollProgress();


/* =========================================================
   NAVBAR SCROLL
========================================================= */

const navbar = $("#navbar");

function updateNavbar() {

  if (!navbar) return;

  if (window.scrollY > 40) {

    navbar.classList.add("scrolled");

  } else {

    navbar.classList.remove("scrolled");

  }

}

window.addEventListener(
  "scroll",
  updateNavbar,
  { passive: true }
);


/* =========================================================
   HERO PARALLAX
========================================================= */

const heroInner = $("#heroInner");
const heroOrbit = $(".hero-orbit-system");
const heroSatellite = $(".hero-satellite");

let ticking = false;

function updateParallax() {

  if (ticking) return;

  ticking = true;

  requestAnimationFrame(() => {

    const scrollY = window.scrollY;

    if (heroInner && scrollY < window.innerHeight) {

      heroInner.style.transform =
        `translate3d(0, ${scrollY * 0.10}px, 0)`;

    }

    if (heroOrbit && scrollY < window.innerHeight * 1.5) {

      heroOrbit.style.marginTop =
        `${scrollY * 0.08}px`;

      heroOrbit.style.rotate =
        `${scrollY * 0.025}deg`;

    }

    if (heroSatellite) {

      heroSatellite.style.transform =
        `translate3d(
          ${Math.sin(scrollY * 0.01) * 15}px,
          ${Math.cos(scrollY * 0.008) * 15}px,
          0
        ) rotate(-12deg)`;

    }

    ticking = false;

  });

}

window.addEventListener(
  "scroll",
  updateParallax,
  { passive: true }
);


/* =========================================================
   MOUSE TILT
========================================================= */

const tiltElements = $$(".tilt");

tiltElements.forEach((element) => {

  element.addEventListener("mousemove", (event) => {

    if (window.innerWidth < 800) return;

    const rect =
      element.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX =
      ((y - centerY) / centerY) * -3;

    const rotateY =
      ((x - centerX) / centerX) * 3;

    element.style.transform =
      `perspective(900px)
       rotateX(${rotateX}deg)
       rotateY(${rotateY}deg)
       translateY(-3px)`;

  });


  element.addEventListener("mouseleave", () => {

    element.style.transform = "";

  });

});


/* =========================================================
   MAGNETIC BUTTONS
========================================================= */

const magneticButtons =
  $$(".magnetic");

magneticButtons.forEach((button) => {

  button.addEventListener("mousemove", (event) => {

    if (window.innerWidth < 800) return;

    const rect =
      button.getBoundingClientRect();

    const x =
      event.clientX - rect.left - rect.width / 2;

    const y =
      event.clientY - rect.top - rect.height / 2;

    button.style.transform =
      `translate(${x * 0.12}px, ${y * 0.12}px)`;

  });


  button.addEventListener("mouseleave", () => {

    button.style.transform = "";

  });

});


/* =========================================================
   CUSTOM CURSOR
========================================================= */

const cursorDot = $("#cursorDot");
const cursorRing = $("#cursorRing");

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let ringX = mouseX;
let ringY = mouseY;

window.addEventListener("mousemove", (event) => {

  mouseX = event.clientX;
  mouseY = event.clientY;

  if (cursorDot) {

    cursorDot.style.left =
      `${mouseX}px`;

    cursorDot.style.top =
      `${mouseY}px`;

  }

});

function animateCursor() {

  ringX += (mouseX - ringX) * 0.13;
  ringY += (mouseY - ringY) * 0.13;

  if (cursorRing) {

    cursorRing.style.left =
      `${ringX}px`;

    cursorRing.style.top =
      `${ringY}px`;

  }

  requestAnimationFrame(animateCursor);

}

animateCursor();


$$("a, button, input, textarea").forEach((element) => {

  element.addEventListener("mouseenter", () => {

    cursorRing?.classList.add("active");

  });

  element.addEventListener("mouseleave", () => {

    cursorRing?.classList.remove("active");

  });

});


/* =========================================================
   TIMELINE
========================================================= */

const timeline =
  $(".timeline");

const timelineFill =
  $("#timelineFill");

function updateTimeline() {

  if (!timeline || !timelineFill) return;

  const rect =
    timeline.getBoundingClientRect();

  const viewport =
    window.innerHeight;

  const start =
    viewport * 0.75;

  const distance =
    viewport - start;

  const progress =
    Math.min(
      1,
      Math.max(
        0,
        (start - rect.top) /
        Math.max(1, rect.height - distance)
      )
    );

  timelineFill.style.height =
    `${progress * 100}%`;

}

window.addEventListener(
  "scroll",
  updateTimeline,
  { passive: true }
);

updateTimeline();


/* =========================================================
   ORBIT DEPTH RESPONSE
========================================================= */

const solarSystem =
  $(".solar-system");

function updateSolarDepth() {

  if (!solarSystem) return;

  const rect =
    solarSystem.getBoundingClientRect();

  const viewportCenter =
    window.innerHeight / 2;

  const elementCenter =
    rect.top + rect.height / 2;

  const distance =
    elementCenter - viewportCenter;

  const rotation =
    distance * -0.018;

  const scale =
    1 - Math.min(
      0.08,
      Math.abs(distance) / 7000
    );

  solarSystem.style.transform =
    `perspective(1000px)
     rotateX(${rotation}deg)
     scale(${scale})`;

}

window.addEventListener(
  "scroll",
  updateSolarDepth,
  { passive: true }
);

updateSolarDepth();


/* =========================================================
   CONTACT FORM
   FLYRANK WEEK 6 — ONE LIVE FEATURE
========================================================= */

const contactForm =
  $("#contactForm");

const formStatus =
  $("#formStatus");

if (contactForm) {

  contactForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const submitButton =
        $(".form-submit", contactForm);

      const originalText =
        submitButton
          ? submitButton.textContent
          : "";

      if (formStatus) {

        formStatus.className =
          "form-status";

        formStatus.textContent =
          "TRANSMITTING MESSAGE...";

      }

      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "Sending...";

      }

      try {

        const formData =
          new FormData(contactForm);

        const response =
          await fetch(
            contactForm.action,
            {
              method: "POST",
              body: formData,
              headers: {
                Accept:
                  "application/json"
              }
            }
          );


        if (response.ok) {

          contactForm.reset();

          if (formStatus) {

            formStatus.className =
              "form-status success";

            formStatus.textContent =
              "MESSAGE RECEIVED — THANK YOU.";

          }

        } else {

          throw new Error(
            "Submission failed."
          );

        }

      } catch (error) {

        if (formStatus) {

          formStatus.className =
            "form-status error";

          formStatus.textContent =
            "TRANSMISSION FAILED — PLEASE TRY AGAIN.";

        }

      } finally {

        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            originalText || "Send Message";

        }

      }

    }
  );

}


/* =========================================================
   CONTACT ORBIT MOTION
========================================================= */

const contactLayer =
  $(".contact-space-layer");

function updateContactOrbit() {

  if (!contactLayer) return;

  const rect =
    contactLayer.getBoundingClientRect();

  const center =
    window.innerHeight / 2;

  const distance =
    rect.top + rect.height / 2 - center;

  const rotation =
    distance * 0.025;

  contactLayer.style.transform =
    `translateY(-50%) rotate(${rotation}deg)`;

}

window.addEventListener(
  "scroll",
  updateContactOrbit,
  { passive: true }
);


/* =========================================================
   ACTIVE SECTION LINK
========================================================= */

const sections =
  $$("main section[id]");

const navAnchors =
  $$("#navLinks a[href^='#']");

const sectionObserver =
  new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (!entry.isIntersecting) return;

        navAnchors.forEach((link) => {

          link.classList.remove("active");

          if (
            link.getAttribute("href") ===
            `#${entry.target.id}`
          ) {

            link.classList.add("active");

          }

        });

      });

    },
    {
      rootMargin:
        "-35% 0px -55% 0px"
    }
  );

sections.forEach((section) => {

  sectionObserver.observe(section);

});


/* =========================================================
   KEYBOARD ACCESSIBILITY
========================================================= */

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    navLinks?.classList.remove("open");

    navToggle?.setAttribute(
      "aria-expanded",
      "false"
    );

  }

});


/* =========================================================
   INITIAL UPDATE
========================================================= */

window.addEventListener(
  "load",
  () => {

    updateScrollProgress();
    updateNavbar();
    updateTimeline();
    updateSolarDepth();
    updateContactOrbit();

  }
);
