/* ==========================================================================
   AI CONCLAVE 2026 — REGISTER PAGE SCRIPT
   Same shared core as every other page's script.js (initMobileNav,
   initScrollReveal, initScrollProgress, initCountUp — the last one is a
   no-op here since this page has no [data-count-to] elements), plus this
   page's own registration-form handling. There is no backend yet, so a
   successful submit just logs the data and shows an on-page confirmation.

   CONTENTS
   1. initMobileNav()      — hamburger toggle for the sticky header — SHARED
   2. initScrollReveal()   — fade/slide-in for [data-reveal] elements — SHARED
   3. initScrollProgress() — fills the top signal bar as the page scrolls — SHARED
   4. initCountUp()        — animates [data-count-to] numbers into view — SHARED
   5. initRegisterForm()   — wires up submit + "register another" handlers
   6. getSelectedTracks()  — reads the checked track checkboxes
   7. validateForm()       — required-field check, surfaces the inline error
   8. submitRegistration() — isolated "send to backend" step (placeholder)
   9. showConfirmation()   — renders the confirmation panel from form data
   10. resetToForm()       — lets someone register a second person
   11. escapeHtml()        — escapes text before it's inserted as innerHTML
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollReveal();
  initScrollProgress();
  initCountUp();
  initRegisterForm();
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
 * scrolls into view. Register has no such elements today, but the
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
 * Wires up the registration form: validates on submit, hands valid
 * data off to submitRegistration(), and swaps the form out for the
 * confirmation panel on success.
 */
function initRegisterForm() {
  const form = document.getElementById("register-form");

  if (!form) {
    return;
  }

  const errorMessage = document.getElementById("register-error");
  const registerAgainBtn = document.getElementById("register-again");

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateForm(form)) {
      errorMessage.classList.add("is-visible");
      return;
    }

    errorMessage.classList.remove("is-visible");

    const formData = {
      name: form.elements["name"].value.trim(),
      email: form.elements["email"].value.trim(),
      phone: form.elements["phone"].value.trim(),
      organisation: form.elements["organisation"].value.trim(),
      category: form.elements["category"].value,
      tracks: getSelectedTracks(form),
    };

    submitRegistration(formData).then(() => {
      showConfirmation(formData);
    });
  });

  if (registerAgainBtn) {
    registerAgainBtn.addEventListener("click", () => resetToForm(form));
  }
}

/**
 * Returns the values of every checked "tracks" checkbox in the form.
 */
function getSelectedTracks(form) {
  return Array.from(form.querySelectorAll('input[name="tracks"]:checked')).map(
    (checkbox) => checkbox.value
  );
}

/**
 * Basic required-field validation for the text/email/phone/org/category
 * inputs. The track checklist itself is optional, so it isn't checked here.
 */
function validateForm(form) {
  const requiredFields = ["name", "email", "phone", "organisation", "category"];

  return requiredFields.every((fieldName) => {
    const field = form.elements[fieldName];
    return field && field.value.trim() !== "";
  });
}

/**
 * Stands in for the real registration endpoint. Logs the payload so it's
 * inspectable during development/demo and resolves like a network call
 * would, so the calling code doesn't need to change when this is replaced.
 *
 * TODO: replace this with a real API/Google Sheet endpoint later
 */
function submitRegistration(formData) {
  console.log("Registration submitted:", formData);
  return Promise.resolve(formData);
}

/**
 * Fills the confirmation panel with a summary of what was submitted,
 * then swaps it in for the form.
 */
function showConfirmation(formData) {
  const form = document.getElementById("register-form");
  const panel = document.getElementById("confirmation-panel");
  const summary = document.getElementById("confirmation-summary");

  if (!panel || !summary) {
    return;
  }

  const trackList = formData.tracks.length ? formData.tracks.join(", ") : "None selected";

  summary.innerHTML = `
    <dt>Name</dt>
    <dd>${escapeHtml(formData.name)}</dd>
    <dt>Email</dt>
    <dd>${escapeHtml(formData.email)}</dd>
    <dt>Category</dt>
    <dd>${escapeHtml(formData.category)}</dd>
    <dt>Tracks</dt>
    <dd>${escapeHtml(trackList)}</dd>
  `;

  form.style.display = "none";
  panel.classList.add("is-visible");
  panel.setAttribute("tabindex", "-1");
  panel.focus();
}

/**
 * Reverses showConfirmation() so a volunteer at a shared kiosk can
 * register the next person without reloading the page.
 */
function resetToForm(form) {
  const panel = document.getElementById("confirmation-panel");

  form.reset();
  form.style.display = "";
  panel.classList.remove("is-visible");
  form.elements["name"].focus();
}

/**
 * Escapes user-entered text before it's inserted as innerHTML in the
 * confirmation summary, so a name/email containing "<" or "&" can't
 * break the markup.
 */
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
