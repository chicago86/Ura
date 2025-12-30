export function homePage(): string {
  return `
    <section class="page page--home">
      <div class="hero hero--swirl">
        <div class="hero__bg hero__bg--swirl" aria-hidden="true"></div>
        <div class="hero__overlay" aria-hidden="true"></div>

        <div class="hero__inner hero__inner--e360">
          <div class="hero__badge">
            <span class="hero__badgeLogo">FusioEnergy</span>
            <span class="hero__badgeText" data-i18n="home.badge">
              Програмне забезпечення для моніторингу енергоспоживання
            </span>
          </div>

          <h1 class="hero__title">
            <span data-i18n="home.titleA">Відстежуйте кожен</span>
            <span class="hero__unit" data-i18n="home.unit">кВт·год</span>
            <span data-i18n="home.titleB">і запобігайте втратам енергії в режимі реального часу.</span>
          </h1>

          <p class="hero__lead" data-i18n="home.lead">
            Отримайте повну інформацію про енергоспоживання вашого підприємства. Виявляйте неефективність,
            знижуйте пікові навантаження та відстежуйте роботу кожної панелі, зони й обладнання за допомогою
            панелі моніторингу FusioEnergy в режимі реального часу.
          </p>

          <div class="hero__cta">
            <button class="btn btn--primary" type="button" data-demo-open data-i18n="home.cta1">
              Замовити демонстрацію
            </button>
          </div>
        </div>
      </div>

     <!-- ===== DEMO MODAL ===== -->
<div class="dm" id="demoModal" aria-hidden="true">
  <div class="dm__backdrop" data-demo-close></div>

  <div class="dm__dialog" role="dialog" aria-modal="true" aria-labelledby="dmTitle">
    <button class="dm__close" type="button" aria-label="Close" data-demo-close>×</button>

    <div class="dm__content">
      <div class="dm__head">
        <h2 class="dm__title" id="dmTitle">Запланувати дзвінок</h2>
        <p class="dm__subtitle">Ми зв’яжемося з вами, щоб показати, як працює FusioEnergy.</p>
      </div>

      <form class="dm__form" novalidate>
        <div class="dm__grid">
          <div class="dm__field dm__field--name">
            <label class="dm__label" for="dmName">Ім’я</label>
            <input class="dm__input" id="dmName" name="name" type="text" autocomplete="name" />
            <div class="dm__err" data-err="name"></div>
          </div>

          <div class="dm__field">
            <label class="dm__label" for="dmCompany">Компанія</label>
            <input class="dm__input" id="dmCompany" name="company" type="text" autocomplete="organization" />
            <div class="dm__err" data-err="company"></div>
          </div>

          <div class="dm__field">
            <label class="dm__label" for="dmEmail">Робочий Email</label>
            <input class="dm__input" id="dmEmail" name="email" type="email" autocomplete="email" />
            <div class="dm__err" data-err="email"></div>
          </div>

          <div class="dm__field">
            <label class="dm__label" for="dmPhone">Телефон</label>
            <div class="dm__phone">
              <span class="dm__phoneIcon" aria-hidden="true">🌐</span>
              <input class="dm__input" id="dmPhone" name="phone" type="tel" placeholder="+380…" autocomplete="tel" />
            </div>
            <div class="dm__err" data-err="phone"></div>
          </div>
        </div>

        <div class="dm__actions">
          <button class="dm__submit" type="submit">Надіслати запит</button>
        </div>

        <label class="dm__consent">
          <input class="dm__check" type="checkbox" name="consent" />
          <span>
            Ваші персональні дані будуть оброблятися відповідно до нашої
            <a class="dm__link" href="#" target="_blank" rel="noopener">політики конфіденційності</a>.
            Поставте галочку, що ви прочитали та зрозуміли політику.
          </span>
        </label>

        <div class="dm__err dm__err--consent" data-err="consent"></div>
        <div class="dm__ok" aria-live="polite"></div>
      </form>
    </div>
  </div>
</div>
<!-- ===== /DEMO MODAL ===== -->

    </section>
  `;
}
