export function aboutPage(): string {
  return `
    <section class="page page--about">
      <h1 data-i18n="about.title">About</h1>
      <p class="muted" data-i18n="about.lead">
        Fusioeng helps teams track electricity usage with clear dashboards and reliable device integration.
      </p>

      <div class="grid">
        <div class="card">
          <h3 data-i18n="about.m1Title">Mission</h3>
          <p data-i18n="about.m1Text">
            Make energy data understandable: collect, validate, visualize, and act.
          </p>
        </div>

        <div class="card">
          <h3 data-i18n="about.m2Title">How we work</h3>
          <p data-i18n="about.m2Text">
            Start small (1 device), confirm accuracy, then scale to circuits, sites, and reports.
          </p>
        </div>

        <div class="card">
          <h3 data-i18n="about.m3Title">What you get</h3>
          <p data-i18n="about.m3Text">
            A stable pipeline, clean UI, and exports for accounting and operations.
          </p>
        </div>
      </div>

      <div class="card">
        <h3 data-i18n="about.stackTitle">Stack</h3>
        <ul class="list">
          <li data-i18n="about.stack1">TypeScript + SCSS</li>
          <li data-i18n="about.stack2">i18n via JSON locales</li>
          <li data-i18n="about.stack3">Modbus register maps & validation</li>
        </ul>
      </div>
    </section>
  `;
}
