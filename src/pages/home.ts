export function homePage(): string {
  return `
    <section class="page page--home">
      <div class="hero hero--swirl">
        <div class="hero__bg hero__bg--swirl" aria-hidden="true"></div>

        <!-- ВАЖНО: контент теперь внутри hero__inner -->
        <div class="hero__inner">
          <div class="hero__left">
            <h1 data-i18n="home.heroTitle">Energy monitoring that feels simple</h1>
            <p class="muted" data-i18n="home.heroText">
              TypeScript + SCSS + i18n. Fast setup. Clean dashboards.
            </p>

            <div class="hero__cta">
              <a class="btn btn--primary" href="/services" data-route data-i18n="home.ctaPrimary">View services</a>
              <a class="btn" href="/contact" data-route data-i18n="home.ctaSecondary">Contact us</a>
            </div>

            <div class="hero__bullets">
              <div class="pill" data-i18n="home.p1">Modbus RTU/TCP support</div>
              <div class="pill" data-i18n="home.p2">Realtime + history</div>
              <div class="pill" data-i18n="home.p3">Alerts & exports</div>
            </div>
          </div>

          <div class="hero__right">
            <div class="stats">
              <div class="stat">
                <div class="stat__k" data-i18n="home.k1">Devices</div>
                <div class="stat__v">24/7</div>
                <div class="stat__t muted" data-i18n="home.t1">stable polling</div>
              </div>
              <div class="stat">
                <div class="stat__k" data-i18n="home.k2">Dashboards</div>
                <div class="stat__v">⚡</div>
                <div class="stat__t muted" data-i18n="home.t2">fast insights</div>
              </div>
              <div class="stat">
                <div class="stat__k" data-i18n="home.k3">Reports</div>
                <div class="stat__v">PDF/CSV</div>
                <div class="stat__t muted" data-i18n="home.t3">ready to share</div>
              </div>
            </div>

            <div class="card card--soft">
              <p class="muted" data-i18n="home.note">
                Tip: switch language anytime — content updates instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
