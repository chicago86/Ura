export function contactPage(): string {
  return `
    <section class="page page--contact">
      <h1 data-i18n="contact.title">Contact</h1>
      <p class="muted" data-i18n="contact.lead">
        Tell us what devices you have and what you want to see on the dashboard.
      </p>

      <div class="grid grid--2">
        <div class="card">
          <h3 data-i18n="contact.formTitle">Quick request</h3>

          <form class="form" id="contactForm">
            <label class="form__row">
              <span data-i18n="contact.name">Name</span>
              <input type="text" name="name" placeholder="John" />
            </label>

            <label class="form__row">
              <span data-i18n="contact.email">Email</span>
              <input type="email" name="email" placeholder="name@email.com" />
            </label>

            <label class="form__row">
              <span data-i18n="contact.message">Message</span>
              <textarea name="message" rows="4" placeholder="PMAC / ADW / inverter, goals..."></textarea>
            </label>

            <button class="btn btn--primary" type="submit" data-i18n="contact.send">Send</button>
            <p class="muted tiny" data-i18n="contact.note">
              Demo form: no backend yet. We can connect Telegram/Email later.
            </p>
          </form>
        </div>

        <div class="card card--soft">
          <h3 data-i18n="contact.detailsTitle">Details</h3>
          <div class="kv">
            <div class="kv__k" data-i18n="contact.d1">Response time</div>
            <div class="kv__v" data-i18n="contact.v1">Same day</div>
          </div>
          <div class="kv">
            <div class="kv__k" data-i18n="contact.d2">Region</div>
            <div class="kv__v" data-i18n="contact.v2">Ukraine / EU</div>
          </div>
          <div class="kv">
            <div class="kv__k" data-i18n="contact.d3">Formats</div>
            <div class="kv__v" data-i18n="contact.v3">Dashboards, CSV, PDF</div>
          </div>

          <div class="card card--inner">
            <p class="muted" data-i18n="contact.hint">
              If you already have a register map — attach it and we’ll validate it first.
            </p>
          </div>
        </div>
      </div>
    </section>
  `;
}
