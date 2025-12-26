import "./styles/main.scss";

import { getSavedLang, saveLang } from "./ts/storage";
import { getLang, setLang } from "./ts/i18n";
import { guessLangByGeolocation, guessLangByTimeZone } from "./ts/geoLang";

import { homePage } from "./pages/home";
import { aboutPage } from "./pages/about";
import { servicesPage } from "./pages/services";
import { contactPage } from "./pages/contact";

type Lang = "uk" | "en" | "es";

/* -----------------------------
   Anti-flicker + hover gating (language menu)
------------------------------ */

let closeTimer: number | null = null;
let allowHoverOpen = false;

function forceCloseLangMenuNow() {
  const root = document.getElementById("langPicker");
  const toggle = document.getElementById("langToggle");
  if (!root || !toggle) return;

  root.classList.remove("is-open", "is-expanded");
  toggle.setAttribute("aria-expanded", "false");
}

function enableHoverOpenSoon() {
  // 1) невелика затримка після “переходів”
  window.setTimeout(() => (allowHoverOpen = true), 260);

  // 2) або як тільки користувач реально поворухнув мишею
  const onMove = () => {
    allowHoverOpen = true;
    window.removeEventListener("mousemove", onMove, { capture: true } as any);
  };
  window.addEventListener("mousemove", onMove, { capture: true, once: true });
}

/* -----------------------------
   SPA Router (no reload)
------------------------------ */

const routes: Record<string, () => string> = {
  "/": homePage,
  "/about": aboutPage,
  "/services": servicesPage,
  "/contact": contactPage
};

function normalizePath(p: string): string {
  const x = p.replace(/\/+$/, "");
  return x === "" ? "/" : x;
}

function markActiveNav() {
  const path = normalizePath(location.pathname);
  document.querySelectorAll<HTMLAnchorElement>(".nav a[href]").forEach((a) => {
    const href = normalizePath((a.getAttribute("href") ?? ""));
    const isActive = !!href && href === path;
    a.classList.toggle("is-active", isActive);
  });
}

async function renderRoute(pathname: string) {
  const app = document.getElementById("app");
  if (!app) return;

  const key = normalizePath(pathname);
  const view = routes[key] ?? routes["/"];

  // 1) закрити меню мов, щоб не миготіло при “віртуальному переході”
  forceCloseLangMenuNow();
  allowHoverOpen = false;

  // 2) підмінити контент
  app.innerHTML = view();

  // 3) активний пункт
  markActiveNav();

  // 4) прогнати i18n по новому DOM (важливо)
  await setLang(getLang());

  // 5) після рендера знов дозволити hover-open (з невеликою затримкою)
  allowHoverOpen = false;
  enableHoverOpenSoon();
}

function navigate(to: string) {
  const next = normalizePath(to);
  const cur = normalizePath(location.pathname);
  if (next === cur) return;

  history.pushState({}, "", next);
  renderRoute(location.pathname).catch(console.error);
}

function initSpaNav() {
  // перехоплення кліків по a[data-route]
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("a[data-route]") as HTMLAnchorElement | null;
    if (!a) return;

    const href = a.getAttribute("href") || "/";
    if (!href.startsWith("/")) return;

    e.preventDefault();
    navigate(href);
  });

  // back/forward
  window.addEventListener("popstate", () => {
    renderRoute(location.pathname).catch(console.error);
  });
}

/* -----------------------------
   Language picker UI (hover)
------------------------------ */

function openLangMenu() {
  if (!allowHoverOpen) return;

  const root = document.getElementById("langPicker") as HTMLDivElement | null;
  const toggle = document.getElementById("langToggle") as HTMLButtonElement | null;
  if (!root || !toggle) return;

  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  root.classList.add("is-expanded");
  root.classList.add("is-open");
  toggle.setAttribute("aria-expanded", "true");
}

function closeLangMenuDelayed(delayMs = 220) {
  const root = document.getElementById("langPicker") as HTMLDivElement | null;
  const toggle = document.getElementById("langToggle") as HTMLButtonElement | null;
  if (!root || !toggle) return;

  if (closeTimer) window.clearTimeout(closeTimer);

  closeTimer = window.setTimeout(() => {
    root.classList.remove("is-open");
    root.classList.remove("is-expanded");
    toggle.setAttribute("aria-expanded", "false");
    closeTimer = null;
  }, delayMs);
}

function initLangPicker() {
  const root = document.getElementById("langPicker") as HTMLDivElement | null;
  if (!root) return;

  root.classList.remove("is-open", "is-expanded");

  root.addEventListener("mouseenter", () => openLangMenu());
  root.addEventListener("mouseleave", () => closeLangMenuDelayed(220));
}

function setActiveMenuItem(lang: Lang) {
  document.querySelectorAll<HTMLButtonElement>("#langMenu [data-lang]").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.lang === lang);
  });
}

function updateTopLangValue(lang: Lang) {
  const value = document.getElementById("langValue");
  if (!value) return;

  const btn = document.querySelector<HTMLButtonElement>(`#langMenu [data-lang="${lang}"]`);
  value.textContent = btn?.textContent?.trim() || lang.toUpperCase();
}

function initLangButtons() {
  document.querySelectorAll<HTMLButtonElement>("#langMenu [data-lang]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const lang = btn.dataset.lang as Lang | undefined;
      if (!lang) return;

      saveLang(lang);
      closeLangMenuDelayed(0);

      await setLang(lang);

      setActiveMenuItem(lang);
      updateTopLangValue(lang);
    });
  });
}

/* -----------------------------
   Geo banner
------------------------------ */

async function logGeoPermission() {
  try {
    const status = await navigator.permissions.query({
      name: "geolocation" as PermissionName
    });
    console.log("geo: permission state =", status.state);
  } catch {
    // ignore
  }
}

function forceHideGeoBanner() {
  const banner = document.getElementById("geoBanner") as HTMLDivElement | null;
  if (!banner) return;
  banner.hidden = true;
  banner.style.display = "none";
  banner.classList.add("is-hidden");
}

function closeGeoBanner(banner: HTMLDivElement) {
  banner.classList.add("is-hidden");
  window.setTimeout(() => {
    banner.hidden = true;
    banner.style.display = "none";
  }, 200);
}

function openGeoBanner(banner: HTMLDivElement) {
  banner.style.display = "flex";
  banner.hidden = false;
  banner.classList.remove("is-hidden");
}

async function tryAutoGeolocationWithoutPrompt(): Promise<Lang | null> {
  try {
    return await guessLangByGeolocation();
  } catch {
    return null;
  }
}

function initGeoBanner() {
  const banner = document.getElementById("geoBanner") as HTMLDivElement | null;
  const yes = document.getElementById("geoYes") as HTMLButtonElement | null;
  const no = document.getElementById("geoNo") as HTMLButtonElement | null;

  if (!banner || !yes || !no) return;

  openGeoBanner(banner);

  no.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveLang(getLang() as Lang);
    closeGeoBanner(banner);
  };

  yes.onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const geoLang = await guessLangByGeolocation();
      saveLang(geoLang);

      await setLang(geoLang);

      setActiveMenuItem(geoLang);
      updateTopLangValue(geoLang);
    } catch {
      saveLang(getLang() as Lang);
    } finally {
      closeGeoBanner(banner);
    }
  };
}

/* -----------------------------
   Bootstrap
------------------------------ */

async function afterLanguageSet(lang: Lang) {
  setActiveMenuItem(lang);
  updateTopLangValue(lang);
}

async function bootstrap() {
  await logGeoPermission();

  // SPA navigation
  initSpaNav();

  // language UI
  forceCloseLangMenuNow();
  initLangPicker();
  initLangButtons();

  // language selection
  const saved = getSavedLang() as Lang | null;
  if (saved) {
    forceHideGeoBanner();
    await setLang(saved);
    await afterLanguageSet(saved);
  } else {
    const tzLang = guessLangByTimeZone() as Lang;
    await setLang(tzLang);
    await afterLanguageSet(tzLang);

    const autoGeoLang = await tryAutoGeolocationWithoutPrompt();
    if (autoGeoLang) {
      saveLang(autoGeoLang);
      await setLang(autoGeoLang);
      await afterLanguageSet(autoGeoLang);
      forceHideGeoBanner();
    } else {
      initGeoBanner();
    }
  }

  // first render for current path
  await renderRoute(location.pathname);

  // enable hover-open after everything is ready
  allowHoverOpen = false;
  enableHoverOpenSoon();
}

window.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch(console.error);
});
