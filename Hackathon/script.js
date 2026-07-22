/* ==========================================================================
   AI CONCLAVE 2026 — HACKATHON PAGE SCRIPT
   Small, named functions, one per feature. This file is the same shared
   core used on every page's script.js — Hackathon has no page-specific
   behaviour beyond it, unlike Register/script.js (form handling) or
   Schedule/script.js (Day 1 / Day 2 toggle).

   CONTENTS
   1. initMobileNav()     — hamburger toggle for the sticky header
   2. initScrollReveal()  — fade/slide-in for [data-reveal] elements
   3. initScrollProgress()— fills the top signal bar as the page scrolls
   4. initCountUp()       — animates [data-count-to] numbers into view
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initScrollProgress();
  initCountUp();
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
  // once the browser has navigated to the next page.
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
 * Fills the fixed signal-red bar under the very top of the viewport in
 * proportion to how far down the page you've scrolled. Purely a visual
 * indicator (aria-hidden in the HTML), throttled to one update per
 * animation frame so it doesn't add scroll jank.
 */
function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");

  if (!bar) {
    return;
  }

  let ticking = false;

  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0;
    bar.style.width = progress + "%";
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(updateProgress);
        ticking = true;
      }
    },
    { passive: true }
  );

  updateProgress();
}

/**
 * Animates any [data-count-to] number up from 0 the first time it
 * scrolls into view — e.g. the About page stats or the Hackathon prize
 * figure. The element's starting text is left as the real final value
 * (e.g. "2000+"), so a browser without JS — or with reduced motion —
 * simply shows the correct number with no animation at all.
 */
function initCountUp() {
  const countEls = document.querySelectorAll("[data-count-to]");

  if (!countEls.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    return;
  }

  const formatIndian = (value) => {
    const digits = String(value);
    if (digits.length <= 3) {
      return digits;
    }
    const lastThree = digits.slice(-3);
    const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return `${rest},${lastThree}`;
  };

  const animateCount = (el) => {
    const target = parseInt(el.dataset.countTo, 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const useIndianFormat = el.dataset.format === "indian";
    const duration = 900;
    const startTime = performance.now();

    const renderValue = (value) => {
      const formatted = useIndianFormat ? formatIndian(value) : String(value);
      el.textContent = prefix + formatted + suffix;
    };

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      renderValue(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        renderValue(target);
      }
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  countEls.forEach((el) => observer.observe(el));
}
