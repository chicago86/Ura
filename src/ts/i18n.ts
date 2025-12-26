type Dict = Record<string, any>;

const SUPPORTED = ["uk", "en", "es"] as const;
type Lang = (typeof SUPPORTED)[number];

let dict: Dict = {};
let currentLang: Lang = "en";

function safeLang(v: string | null): Lang {
  return (SUPPORTED as readonly string[]).includes(v ?? "") ? (v as Lang) : "en";
}

function getByPath(obj: Dict, path: string): string | null {
  const parts = path.split(".");
  let cur: any = obj;
  for (const p of parts) {
    cur = cur?.[p];
    if (cur == null) return null;
  }
  return typeof cur === "string" ? cur : null;
}

async function loadLocale(lang: Lang): Promise<Dict> {
  const res = await fetch(`/locales/${lang}.json`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load locale: ${lang}`);
  return res.json();
}

function applyI18nToDom() {
  // text nodes
  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    const value = getByPath(dict, key);
    if (value != null) el.textContent = value;
  });

  // attributes: data-i18n-attr="placeholder|title|aria-label"
  document.querySelectorAll<HTMLElement>("[data-i18n-key][data-i18n-attr]").forEach((el) => {
    const key = el.getAttribute("data-i18n-key");
    const attr = el.getAttribute("data-i18n-attr");
    if (!key || !attr) return;
    const value = getByPath(dict, key);
    if (value != null) el.setAttribute(attr, value);
  });

  // document title from meta.title (як у тебе)
  const title = getByPath(dict, "meta.title");
  if (title) document.title = title;

  // langpicker labels (якщо є)
  const langTitleEl = document.getElementById("langTitle");
  const langValueEl = document.getElementById("langValue");

  const titleText = getByPath(dict, "ui.languageTitle");
  if (langTitleEl && titleText) langTitleEl.textContent = titleText;

  if (langValueEl) {
    // беремо назви мов з dict.lang.uk/en/es якщо вони є
    const name =
      getByPath(dict, `lang.${currentLang}`) ??
      (currentLang === "uk" ? "Українська" : currentLang === "es" ? "Español" : "English");
    langValueEl.textContent = name;
  }

  // підписати кнопки в меню мов
  document.querySelectorAll<HTMLButtonElement>("#langMenu [data-lang]").forEach((btn) => {
    const l = safeLang(btn.dataset.lang ?? "en");
    const label = getByPath(dict, `lang.${l}`) ?? (l === "uk" ? "Українська" : l === "es" ? "Español" : "English");
    btn.textContent = label;
  });
}

export function getLang(): Lang {
  return currentLang;
}

/** Викликати при старті (в main.ts) */
export async function initI18n(): Promise<void> {
  const saved = safeLang(localStorage.getItem("lang"));
  await setLang(saved);
}

/** Міняє мову, зберігає її, оновлює DOM */
export async function setLang(lang: string): Promise<void> {
  const safe = safeLang(lang);
  currentLang = safe;
  dict = await loadLocale(safe);

  localStorage.setItem("lang", safe);
  document.documentElement.lang = safe;

  applyI18nToDom();
}
