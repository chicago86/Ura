type DemoData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  consent: boolean;
};

function q<T extends Element>(sel: string, root: ParentNode = document) {
  return root.querySelector(sel) as T | null;
}
function qa<T extends Element>(sel: string, root: ParentNode = document) {
  return Array.from(root.querySelectorAll(sel)) as T[];
}

function ensureModalDom(): HTMLElement {
  const existing = document.getElementById("demoModalRoot");
  if (existing) return existing;

  const wrap = document.createElement("div");
  wrap.id = "demoModalRoot";
  wrap.className = "dm";
  wrap.setAttribute("aria-hidden", "true");

  wrap.innerHTML = `
    <div class="dm__backdrop" data-demo-close></div>

    <div class="dm__dialog" role="dialog" aria-modal="true" aria-labelledby="dmTitle">
      <button class="dm__close" type="button" aria-label="Close" data-demo-close>×</button>

      <div class="dm__head">
        <h2 class="dm__title" id="dmTitle" data-i18n="demo.title">Запланувати дзвінок</h2>
        <p class="dm__subtitle" data-i18n="demo.subtitle">
          Ми зв’яжемося з вами, щоб показати, як працює FusioEnergy.
        </p>
      </div>

      <form class="dm__form" novalidate>
        <div class="dm__grid">
          <label class="dm__field">
            <span class="dm__label" data-i18n="demo.name">Ім’я</span>
            <input class="dm__input" name="name" type="text" autocomplete="name" />
            <span class="dm__err" data-err="name"></span>
          </label>

          <label class="dm__field">
            <span class="dm__label" data-i18n="demo.company">Компанія</span>
            <input class="dm__input" name="company" type="text" autocomplete="organization" />
            <span class="dm__err" data-err="company"></span>
          </label>

          <label class="dm__field">
            <span class="dm__label" data-i18n="demo.email">Робочий Email</span>
            <input class="dm__input" name="email" type="email" autocomplete="email" />
            <span class="dm__err" data-err="email"></span>
          </label>

          <label class="dm__field dm__field--phone">
            <span class="dm__label" data-i18n="demo.phone">Телефон</span>
            <div class="dm__phone">
              <span class="dm__phoneIcon" aria-hidden="true">🌐</span>
              <input class="dm__input dm__input--phone" name="phone" type="tel" placeholder="+380…" autocomplete="tel" />
            </div>
            <span class="dm__err" data-err="phone"></span>
          </label>

          <button class="dm__submit" type="submit" data-i18n="demo.submit">Надіслати запит</button>
        </div>

        <label class="dm__consent">
          <input class="dm__check" type="checkbox" name="consent" />
          <span class="dm__consentText">
            <span data-i18n="demo.consentA">Ваші персональні дані будуть оброблятися відповідно до нашої</span>
            <a class="dm__link" href="#" target="_blank" rel="noopener" data-i18n="demo.privacy">політики конфіденційності</a>.
            <span data-i18n="demo.consentB">Поставте галочку, що ви прочитали та зрозуміли політику.</span>
          </span>
        </label>
        <span class="dm__err dm__err--consent" data-err="consent"></span>

        <div class="dm__ok" role="status" aria-live="polite"></div>
      </form>
    </div>
  `;

  document.body.appendChild(wrap);
  return wrap;
}

function openModal(modal: HTMLElement) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("dm-open");
  // фокус у перше поле
  const first = q<HTMLInputElement>('input[name="name"]', modal);
  window.setTimeout(() => first?.focus(), 0);
}

function closeModal(modal: HTMLElement) {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("dm-open");
}

function setError(modal: HTMLElement, key: keyof DemoData | "consent", msg: string) {
  const err = q<HTMLElement>(`[data-err="${key}"]`, modal);
  if (err) err.textContent = msg;

  if (key !== "consent") {
    const input = q<HTMLInputElement>(`[name="${key}"]`, modal);
    input?.classList.add("is-invalid");
  }
}

function clearErrors(modal: HTMLElement) {
  qa<HTMLElement>("[data-err]", modal).forEach((x) => (x.textContent = ""));
  qa<HTMLInputElement>(".dm__input", modal).forEach((x) => x.classList.remove("is-invalid"));
  const ok = q<HTMLElement>(".dm__ok", modal);
  if (ok) ok.textContent = "";
}

function readFields(form: HTMLFormElement): DemoData {
  const fd = new FormData(form);
  return {
    name: String(fd.get("name") ?? "").trim(),
    company: String(fd.get("company") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    consent: fd.get("consent") === "on"
  };
}

function validate(data: DemoData, modal: HTMLElement): boolean {
  let ok = true;

  if (!data.name || data.name.length < 2) {
    setError(modal, "name", "Вкажіть ім’я (мін. 2 символи).");
    ok = false;
  }

  // простий email чек
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(data.email);
  if (!emailOk) {
    setError(modal, "email", "Вкажіть коректний Email.");
    ok = false;
  }

  // телефон: дозволяємо +, цифри, пробіли, дужки, дефіси (мін 7 цифр)
  const digits = data.phone.replace(/\D/g, "");
  const phoneOk = digits.length >= 7 && /^[+\d()\s-]+$/.test(data.phone);
  if (!phoneOk) {
    setError(modal, "phone", "Вкажіть коректний номер телефону.");
    ok = false;
  }

  if (!data.consent) {
    setError(modal, "consent", "Потрібна згода з політикою конфіденційності.");
    ok = false;
  }

  return ok;
}

export function initDemoModal() {
  const modal = ensureModalDom();

  // Делегований opener/closer — працює після будь-якого renderRoute()
  document.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;

    const openBtn = t.closest("[data-demo-open]") as HTMLElement | null;
    if (openBtn) {
      e.preventDefault();
      e.stopPropagation();
      clearErrors(modal);
      openModal(modal);
      return;
    }

    const closeBtn = t.closest("[data-demo-close]") as HTMLElement | null;
    if (closeBtn && modal.classList.contains("is-open")) {
      e.preventDefault();
      e.stopPropagation();
      closeModal(modal);
      return;
    }
  });

  // ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal(modal);
    }
  });

  // submit + validation
  const form = q<HTMLFormElement>(".dm__form", modal);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(modal);

    const data = readFields(form);
    if (!validate(data, modal)) return;

    const okEl = q<HTMLElement>(".dm__ok", modal);
    if (okEl) okEl.textContent = "✅ Дякуємо! Запит відправлено. Ми зв’яжемося з вами найближчим часом.";

    form.reset();
    window.setTimeout(() => closeModal(modal), 900);
  });
}
