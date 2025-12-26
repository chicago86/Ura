const KEY = "fusioeng_lang";

export function getSavedLang(): string | null {
  return localStorage.getItem(KEY);
}

export function saveLang(lang: string): void {
  localStorage.setItem(KEY, lang);
}
