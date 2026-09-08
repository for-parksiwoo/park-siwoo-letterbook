const form = document.getElementById("letterbook-form");
const statusElement = document.getElementById("form-status");
const submitButton = form?.querySelector(".submit-button");
const submissionFrame = document.querySelector(".submission-frame");
const scriptUrl = window.LETTERBOOK_CONFIG?.scriptUrl?.trim() || "";
let isSubmitting = false;

const createResponseId = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `letterbook-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const setStatus = (message, type = "") => {
  statusElement.textContent = message;
  statusElement.className = `form-status${type ? ` is-${type}` : ""}`;
};

document.querySelectorAll("[maxlength]").forEach((field) => {
  const counter = document.querySelector(`[data-counter-for="${field.id}"]`);
  if (!counter) return;
  const update = () => { counter.textContent = `${field.value.length} / ${field.maxLength}`; };
  field.addEventListener("input", update);
  update();
});

document.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", () => field.classList.remove("is-invalid"));
  field.addEventListener("change", () => field.classList.remove("is-invalid"));
});

const markFirstInvalidField = () => {
  const invalid = form.querySelector(":invalid");
  if (!invalid) return;
  invalid.classList.add("is-invalid");
  invalid.closest(".form-section, .field, .balance-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => invalid.focus({ preventScroll: true }), 450);
};

form?.addEventListener("submit", (event) => {
  setStatus("");
  if (!form.checkValidity()) {
    event.preventDefault();
    setStatus("아직 작성하지 않은 필수 항목이 있어요. 표시된 질문을 확인해 주세요.", "error");
    markFirstInvalidField();
    return;
  }
  if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(scriptUrl)) {
    event.preventDefault();
    setStatus("응답 저장 연결을 준비 중입니다. 운영진에게 문의해 주세요.", "error");
    return;
  }
  document.getElementById("response-id").value = createResponseId();
  document.getElementById("submitted-at").value = new Date().toISOString();
  form.action = scriptUrl;
  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "마음을 보내는 중…";
  setStatus("응답을 안전하게 저장하고 있어요.");
});

submissionFrame?.addEventListener("load", () => {
  if (!isSubmitting) return;
  isSubmitting = false;
  submitButton.disabled = false;
  submitButton.querySelector("span").textContent = "시우에게 마음 보내기";
  form.reset();
  document.querySelectorAll("[maxlength]").forEach((field) => field.dispatchEvent(new Event("input")));
  setStatus("참여가 완료되었습니다. 소중한 마음을 보내주셔서 감사합니다. 💜", "success");
  document.querySelector(".submit-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
});

const navLinks = [...document.querySelectorAll(".step-nav a")];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`));
  }, { rootMargin: "-18% 0px -62%", threshold: [0.05, 0.2, 0.5] });
  sections.forEach((section) => sectionObserver.observe(section));
}
