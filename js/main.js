/* ==========================================================================
   AI CONCLAVE 2026 — MAIN SITE SCRIPT
   Small, named functions, one per feature. Runs on both index.html and
   register.html (shared header/nav), so every function must be safe to call
   even when its target elements aren't on the current page.

   CONTENTS
   1. initMobileNav()        — hamburger toggle for the sticky header
   2. initScrollReveal()     — fade/slide-in for [data-reveal] elements
   3. initActiveNavLink()    — highlights the nav link for the section in view
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initActiveNavLink();
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

  // Close the mobile nav after a link is picked, so it doesn't stay open
  // when the user lands on the target section.
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

/**
 * Highlights the primary nav link matching whichever top-level
 * section is currently in view, so the nav doubles as a progress
 * indicator on the long index.html page.
 */
function initActiveNavLink() {
  const navLinks = document.querySelectorAll(".main-nav-list a[href^='#']");

  if (!navLinks.length) {
    return;
  }

  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}
