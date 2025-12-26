export function servicesPage(): string {
  return `
    <section class="page page--services">
      <h1 data-i18n="services.title">Services</h1>
      <p class="muted" data-i18n="services.text">
        From device setup to dashboards and analytics.
      </p>

      <div class="grid">
        <div class="card">
          <h3 data-i18n="services.s1Title">Device integration</h3>
          <p data-i18n="services.s1Text">Modbus RTU/TCP register maps, gateways, validation.</p>
        </div>

        <div class="card">
          <h3 data-i18n="services.s2Title">Dashboards</h3>
          <p data-i18n="services.s2Text">Realtime + historical, per-circuit, alerts, exports.</p>
        </div>

        <div class="card">
          <h3 data-i18n="services.s3Title">Reporting</h3>
          <p data-i18n="services.s3Text">Daily/weekly/monthly reports, cost & tariff analysis.</p>
        </div>
      </div>
    </section>
  `;
}
