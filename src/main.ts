import "./styles/main.scss";

import { getSavedLang, saveLang } from "./ts/storage";
import { getLang, setLang } from "./ts/i18n";
import { guessLangByGeolocation, guessLangByTimeZone } from "./ts/geoLang";

import { homePage } from "./pages/home";
import { aboutPage } from "./pages/about";
import { servicesPage } from "./pages/services";
import { contactPage } from "./pages/contact";

type Lang = "uk" | "en" | "es";

/** Swirl HERO (public/swirl/swirl-hero.js) */
declare global {
  interface Window {
    SwirlHero?: { mount: () => void; unmount: () => void };
  }
}

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
  window.setTimeout(() => (allowHoverOpen = true), 260);

  const onMove = () => {
    allowHoverOpen = true;
    window.removeEventListener("mousemove", onMove, { capture: true } as any);
  };
  window.addEventListener("mousemove", onMove, { capture: true, once: true });
}

/* -----------------------------
   Mobile menu (burger) — ONLY <= 640px
------------------------------ */

function isMobileNavMode() {
  return window.matchMedia("(max-width: 640px)").matches;
}

function forceCloseMobileMenuNow() {
  const header = document.querySelector(".header") as HTMLDivElement | null;
  const btn = document.getElementById("menuBtn") as HTMLButtonElement | null;
  const overlay = document.getElementById("menuOverlay") as HTMLDivElement | null;

  if (!header || !btn || !overlay) return;

  header.classList.remove("is-menu-open");
  btn.setAttribute("aria-expanded", "false");
  overlay.hidden = true;
}

function openMobileMenu() {
  const header = document.querySelector(".header") as HTMLDivElement | null;
  const btn = document.getElementById("menuBtn") as HTMLButtonElement | null;
  const overlay = document.getElementById("menuOverlay") as HTMLDivElement | null;

  if (!header || !btn || !overlay) return;

  header.classList.add("is-menu-open");
  btn.setAttribute("aria-expanded", "true");
  overlay.hidden = false;

  // не відкривати 2 меню одночасно
  forceCloseLangMenuNow();
}

function toggleMobileMenu() {
  if (!isMobileNavMode()) return;

  const header = document.querySelector(".header") as HTMLDivElement | null;
  if (!header) return;

  header.classList.contains("is-menu-open") ? forceCloseMobileMenuNow() : openMobileMenu();
}

function initMobileMenu() {
  const btn = document.getElementById("menuBtn") as HTMLButtonElement | null;
  const overlay = document.getElementById("menuOverlay") as HTMLDivElement | null;
  const nav = document.getElementById("siteNav") as HTMLDivElement | null;

  if (!btn || !overlay || !nav) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileMenu();
  });

  overlay.addEventListener("click", () => forceCloseMobileMenuNow());

  // закривати меню після кліку на пункт на мобільному
  nav.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("a");
    if (a && isMobileNavMode()) forceCloseMobileMenuNow();
  });

  // ESC закриває все
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      forceCloseMobileMenuNow();
      forceCloseLangMenuNow();
    }
  });

  // якщо вийшли з мобільного режиму — закрити мобільне меню
  window.addEventListener("resize", () => {
    if (!isMobileNavMode()) forceCloseMobileMenuNow();
  });
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
    const href = normalizePath(a.getAttribute("href") ?? "");
    const isActive = !!href && href === path;
    a.classList.toggle("is-active", isActive);
  });
}

function updateHeroSwirl(routeKey: string) {
  // остановить на всех страницах
  window.SwirlHero?.unmount?.();

  // включить только на Home
  if (routeKey === "/") {
    // чтобы контейнер уже имел размеры
    requestAnimationFrame(() => window.SwirlHero?.mount?.());
  }
}

async function renderRoute(pathname: string) {
  const app = document.getElementById("app");
  if (!app) return;

  const key = normalizePath(pathname);
  const view = routes[key] ?? routes["/"];

  forceCloseLangMenuNow();
  forceCloseMobileMenuNow();
  allowHoverOpen = false;

  // ВАЖНО: перед заменой DOM — выключаем swirl
  window.SwirlHero?.unmount?.();

  app.innerHTML = view();

  markActiveNav();

  await setLang(getLang());

  // ВАЖНО: после рендера — включаем только на "/"
  updateHeroSwirl(key);

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
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("a[data-route]") as HTMLAnchorElement | null;
    if (!a) return;

    const href = a.getAttribute("href") || "/";
    if (!href.startsWith("/")) return;

    e.preventDefault();
    navigate(href);
  });

  window.addEventListener("popstate", () => {
    renderRoute(location.pathname).catch(console.error);
  });
}

/* -----------------------------
   Language picker UI (hover + click)
------------------------------ */

function openLangMenuHover() {
  if (!allowHoverOpen) return;

  const root = document.getElementById("langPicker") as HTMLDivElement | null;
  const toggle = document.getElementById("langToggle") as HTMLButtonElement | null;
  if (!root || !toggle) return;

  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  root.classList.add("is-expanded", "is-open");
  toggle.setAttribute("aria-expanded", "true");
}

function openLangMenuForce() {
  const root = document.getElementById("langPicker") as HTMLDivElement | null;
  const toggle = document.getElementById("langToggle") as HTMLButtonElement | null;
  if (!root || !toggle) return;

  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  root.classList.add("is-expanded", "is-open");
  toggle.setAttribute("aria-expanded", "true");

  // закрити мобільне меню якщо було
  forceCloseMobileMenuNow();
}

function closeLangMenuDelayed(delayMs = 220) {
  const root = document.getElementById("langPicker") as HTMLDivElement | null;
  const toggle = document.getElementById("langToggle") as HTMLButtonElement | null;
  if (!root || !toggle) return;

  if (closeTimer) window.clearTimeout(closeTimer);

  closeTimer = window.setTimeout(() => {
    root.classList.remove("is-open", "is-expanded");
    toggle.setAttribute("aria-expanded", "false");
    closeTimer = null;
  }, delayMs);
}

function initLangPicker() {
  const root = document.getElementById("langPicker") as HTMLDivElement | null;
  const toggle = document.getElementById("langToggle") as HTMLButtonElement | null;
  if (!root || !toggle) return;

  root.classList.remove("is-open", "is-expanded");

  root.addEventListener("mouseenter", () => openLangMenuHover());
  root.addEventListener("mouseleave", () => closeLangMenuDelayed(220));

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    const isOpen = root.classList.contains("is-open");
    if (isOpen) closeLangMenuDelayed(0);
    else openLangMenuForce();
  });

  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (!t.closest("#langPicker")) closeLangMenuDelayed(0);
  });
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

  initSpaNav();
  initMobileMenu();

  forceCloseLangMenuNow();
  initLangPicker();
  initLangButtons();

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

  await renderRoute(location.pathname);

  allowHoverOpen = false;
  enableHoverOpenSoon();

  document.documentElement.classList.remove("js-booting");
}

window.addEventListener("DOMContentLoaded", () => {
  bootstrap().catch(console.error);
});
