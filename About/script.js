/* ==========================================================================
   AI CONCLAVE 2026 — ABOUT PAGE SCRIPT
   Shared core (initMobileNav + initScrollReveal) — same as every other
   page's script.js. About has no page-specific behaviour beyond that.

   CONTENTS
   1. initMobileNav()    — hamburger toggle for the sticky header
   2. initScrollReveal() — fade/slide-in for [data-reveal] elements
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
});

/**
 * Toggles the off-canvas mobile nav open/closed and keeps the
 * hamburger button's aria-expanded state in sync.
 */
function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("nav-open", isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });
}

/**
 * Fades/slides [data-reveal] elements into view as they enter the
 * viewport. Skips straight to visible when the browser has no
 * IntersectionObserver, or when the user prefers reduced motion
 * (CSS also hard-disables the transition in that case).
 */
function initScrollReveal() {
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (!revealEls.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
}
