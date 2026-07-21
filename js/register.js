/* ==========================================================================
   AI CONCLAVE 2026 — REGISTRATION FORM SCRIPT
   Handles the register.html form only. There is no backend yet, so a
   successful submit just logs the data and shows an on-page confirmation.

   CONTENTS
   1. initRegisterForm()   — wires up submit + "register another" handlers
   2. getSelectedTracks()  — reads the checked track checkboxes
   3. validateForm()       — required-field check, surfaces the inline error
   4. submitRegistration() — isolated "send to backend" step (placeholder)
   5. showConfirmation()   — renders the confirmation panel from form data
   6. resetToForm()        — lets someone register a second person
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initRegisterForm();
});

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
