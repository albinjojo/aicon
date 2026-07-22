/* ==========================================================================
   AI CONCLAVE 2026 — SCHEDULE PAGE SCRIPT
   Shared core (initMobileNav, initScrollReveal, initScrollProgress,
   initCountUp — the last one is a no-op here since this page has no
   [data-count-to] elements) — same as every other page's script.js —
   plus this page's own Day 1 / Day 2 toggle.

   CONTENTS
   1. initMobileNav()      — hamburger toggle for the sticky header — SHARED
   2. initScrollReveal()   — fade/slide-in for [data-reveal] elements — SHARED
   3. initScrollProgress() — fills the top signal bar as the page scrolls — SHARED
   4. initCountUp()        — animates [data-count-to] numbers into view — SHARED
   5. initScheduleTabs()   — Day 1 / Day 2 toggle for the schedule tables
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initScrollProgress();
  initCountUp();
  initScheduleTabs();
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
 * scrolls into view. Schedule has no such elements today, but the
 * function is safe to call unconditionally — it just no-ops.
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

/**
 * Lets a reader flip between Day 1 and Day 2 instead of scanning both
 * schedule tables at once. #panel is grouped with Day 1 since the panel
 * discussion is that day's 10:30 AM row. Defaults to Day 1 only once JS
 * has run — without JS, both days stay visible (the HTML never hides
 * them), so nothing is lost for a reader without scripting.
 */
function initScheduleTabs() {
  const buttons = document.querySelectorAll(".day-toggle-btn");

  if (!buttons.length) {
    return;
  }

  const day1Sections = [document.getElementById("schedule-day1"), document.getElementById("panel")].filter(Boolean);
  const day2Sections = [document.getElementById("schedule-day2")].filter(Boolean);

  if (!day1Sections.length || !day2Sections.length) {
    return;
  }

  const showDay = (day) => {
    day1Sections.forEach((section) => {
      section.hidden = day !== "1";
    });
    day2Sections.forEach((section) => {
      section.hidden = day !== "2";
    });

    buttons.forEach((btn) => {
      const isActive = btn.dataset.dayTarget === day;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => showDay(btn.dataset.dayTarget));
  });

  showDay("1");
}
