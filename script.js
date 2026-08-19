const menuButton = document.querySelector(".menu-button");
const siteMenu = document.querySelector(".site-menu");
const revealItems = document.querySelectorAll(".reveal");
const dustField = document.querySelector(".dust-field");
const lensButtons = document.querySelectorAll(".lens-button");
const lensCopy = document.querySelector("#lens-copy");
const skillItems = document.querySelectorAll(".skill-grid span");
const guide = document.querySelector(".guide");
const guideShell = document.querySelector(".guide-shell");
const guideSpeech = document.querySelector("#guide-speech");
const guidePupils = document.querySelectorAll(".guide-pupil");
const previewSwitch = document.querySelector(".preview-switch");

const lensText = {
  systems: "Architecture, reliability, and end-to-end ownership sit underneath the strongest projects.",
  commerce: "Marketplaces, checkout flows, trust layers, and vendor operations carry the commercial work.",
  context: "The sharpest ideas come from MAU, Yola, Nigerian students, local vendors, and overlooked user realities.",
  delivery: "Payment handling, deployment, notifications, API work, and operations turn ideas into usable products."
};

function emitDust(x, y, amount = 12) {
  if (!dustField || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (let index = 0; index < amount; index += 1) {
    const particle = document.createElement("span");
    const spreadX = (Math.random() - 0.5) * 90;
    const spreadY = (Math.random() - 0.5) * 70;

    particle.className = "dust";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--x", `${spreadX}px`);
    particle.style.setProperty("--y", `${spreadY}px`);
    dustField.appendChild(particle);

    window.setTimeout(() => particle.remove(), 940);
  }
}

function nudgeGuide(mode = "is-working") {
  if (!guide) return;
  guide.classList.remove("is-working", "is-pointing");
  window.requestAnimationFrame(() => {
    guide.classList.add(mode);
    window.setTimeout(() => guide.classList.remove(mode), 1250);
  });
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.classList.toggle("is-open");
  siteMenu.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));

  const rect = menuButton.getBoundingClientRect();
  emitDust(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
  nudgeGuide(isOpen ? "is-pointing" : "is-working");
});

siteMenu.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    menuButton.classList.remove("is-open");
    siteMenu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");

      const rect = entry.target.getBoundingClientRect();
      emitDust(rect.left + rect.width * 0.18, rect.top + rect.height * 0.18, 7);
      nudgeGuide("is-working");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

function shuffleSkills(lens) {
  skillItems.forEach((item, index) => {
    const fits = item.dataset.tags.includes(lens);
    item.style.order = fits ? index : index + 30;
    item.classList.toggle("is-emphasized", fits);
    item.classList.toggle("is-muted", !fits);
  });
}

lensButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const lens = button.dataset.lens;

    lensButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    lensCopy.textContent = lensText[lens];

    shuffleSkills(lens);

    const rect = button.getBoundingClientRect();
    emitDust(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
    nudgeGuide("is-pointing");
  });
});

previewSwitch?.addEventListener("click", () => {
  const rect = previewSwitch.getBoundingClientRect();
  emitDust(rect.left + rect.width / 2, rect.top + rect.height / 2, 12);
  nudgeGuide("is-pointing");
});

shuffleSkills("systems");

/* ---------------------------------------------------------
   Guide: draggable, eye-tracking, speech-bubble interactions
--------------------------------------------------------- */

const guideTips = [
  "Hi, I'm Goje's guide 👋",
  "Tap a project on the right to preview it live",
  "Built with Flask, Next.js & late nights in Yola",
  "Chemical Engineer by discipline, developer by obsession",
  "Go on, drag me somewhere else on screen",
  "Say hi via the contact section below ↓",
  "Try the capability lenses up top",
  "Mahrab eSquare is my flagship build"
];
let guideTipIndex = 0;
let guideSpeakTimer = null;

function speakGuide(text) {
  if (!guide || !guideSpeech) return;
  guideSpeech.textContent = text;
  guide.classList.add("is-talking");
  window.clearTimeout(guideSpeakTimer);
  guideSpeakTimer = window.setTimeout(() => guide.classList.remove("is-talking"), 3400);
}

function trackGuidePupils(clientX, clientY) {
  guidePupils.forEach((pupil) => {
    const socket = pupil.parentElement.getBoundingClientRect();
    if (socket.width === 0) return;
    const cx = socket.left + socket.width / 2;
    const cy = socket.top + socket.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.min(2.2, Math.hypot(dx, dy) / 50);
    const angle = Math.atan2(dy, dx);
    pupil.style.setProperty("--px", `${(Math.cos(angle) * dist).toFixed(2)}px`);
    pupil.style.setProperty("--py", `${(Math.sin(angle) * dist).toFixed(2)}px`);
  });
}

let isDraggingGuide = false;
let guideDragMoved = false;
let guideDragOffsetX = 0;
let guideDragOffsetY = 0;

window.addEventListener("pointermove", (event) => {
  trackGuidePupils(event.clientX, event.clientY);

  if (!isDraggingGuide && guideShell) {
    const x = (event.clientX / window.innerWidth - 0.5) * 8;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    guideShell.style.translate = `${x}px ${y}px`;
  }
});

if (guide) {
  guide.addEventListener("pointerdown", (event) => {
    isDraggingGuide = true;
    guideDragMoved = false;
    guide.setPointerCapture(event.pointerId);
    const rect = guide.getBoundingClientRect();
    guideDragOffsetX = event.clientX - rect.left;
    guideDragOffsetY = event.clientY - rect.top;
    guide.classList.add("is-dragging");
  });

  guide.addEventListener("pointermove", (event) => {
    if (!isDraggingGuide) return;

    const moveX = event.clientX - guideDragOffsetX;
    const moveY = event.clientY - guideDragOffsetY;

    if (!guideDragMoved &&
        (Math.abs(moveX - (guide.offsetLeft || 0)) > 4 || Math.abs(moveY - (guide.offsetTop || 0)) > 4)) {
      guideDragMoved = true;
    }

    if (guideDragMoved) {
      const maxX = window.innerWidth - guide.offsetWidth - 8;
      const maxY = window.innerHeight - guide.offsetHeight - 8;
      guide.style.left = `${Math.max(8, Math.min(maxX, moveX))}px`;
      guide.style.top = `${Math.max(8, Math.min(maxY, moveY))}px`;
      guide.style.right = "auto";
      guide.style.bottom = "auto";
    }
  });

  guide.addEventListener("pointerup", (event) => {
    isDraggingGuide = false;
    guide.classList.remove("is-dragging");
    if (guide.hasPointerCapture(event.pointerId)) {
      guide.releasePointerCapture(event.pointerId);
    }

    guide.classList.add("has-interacted");

    if (!guideDragMoved) {
      nudgeGuide("is-pointing");
      speakGuide(guideTips[guideTipIndex % guideTips.length]);
      guideTipIndex += 1;

      const rect = guide.getBoundingClientRect();
      emitDust(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    }
  });

  guide.addEventListener("pointercancel", () => {
    isDraggingGuide = false;
    guide.classList.remove("is-dragging");
  });
}

/* ---------------------------------------------------------
   Work section: live iframe preview switching via project tabs
--------------------------------------------------------- */

const projectTabs = document.querySelectorAll(".project-tab");
const projectIframe = document.querySelector("#project-iframe");
const previewUrl = document.querySelector("#preview-url");
const previewOpen = document.querySelector("#preview-open");
const previewDesc = document.querySelector("#preview-desc");
const previewStack = document.querySelector("#preview-stack");
const previewRole = document.querySelector("#preview-role");
const previewLoading = document.querySelector("#preview-frame-loading");
const previewFallback = document.querySelector("#preview-frame-fallback");
const previewFallbackLink = document.querySelector("#preview-fallback-link");

let previewFallbackTimer = null;

function hostFromUrl(url) {
  try {
    return new URL(url).host;
  } catch (error) {
    return url;
  }
}

function loadProjectPreview(tab) {
  const { url, name, desc, stack, role } = tab.dataset;
  if (!url || !projectIframe) return;

  projectTabs.forEach((item) => {
    const isActive = item === tab;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", String(isActive));
  });

  projectIframe.classList.remove("is-loaded");
  previewLoading?.classList.remove("is-hidden");
  previewFallback?.classList.remove("is-visible");
  window.clearTimeout(previewFallbackTimer);

  if (previewUrl) previewUrl.textContent = hostFromUrl(url);
  if (previewOpen) previewOpen.href = url;
  if (previewFallbackLink) previewFallbackLink.href = url;
  if (previewDesc) previewDesc.textContent = desc || "";
  if (previewStack) previewStack.textContent = stack || "";
  if (previewRole) previewRole.textContent = role || "";

  projectIframe.src = url;

  previewFallbackTimer = window.setTimeout(() => {
    previewFallback?.classList.add("is-visible");
  }, 6000);

  nudgeGuide("is-working");
  speakGuide(`Loading ${name || "project"} preview…`);
}

projectTabs.forEach((tab) => {
  tab.addEventListener("click", () => loadProjectPreview(tab));
});

projectIframe?.addEventListener("load", () => {
  projectIframe.classList.add("is-loaded");
  previewLoading?.classList.add("is-hidden");
  window.clearTimeout(previewFallbackTimer);
});