const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const langButton = document.querySelector('.lang-switch');
const navDropdown = document.querySelector('.nav__dropdown');
const navDropdownToggle = document.querySelector('.nav__dropdown-toggle');

const pageMeta = {
  ru: {
    title: 'Наши учителя | Европейская гимназия Днепр',
    description: 'Учителя Европейской гимназии: современные технологии, творческие проекты, индивидуальные учебные программы и живой интерес к знаниям.',
    switchLabel: 'Перемкнути сайт українською мовою',
    phoneLabel: 'Позвонить: +38 067 175 77 73',
    navLabel: 'Основная навигация'
  },
  uk: {
    title: 'Наші вчителі | Європейська гімназія Дніпро',
    description: 'Вчителі Європейської гімназії: сучасні технології, творчі проєкти, індивідуальні навчальні програми і живий інтерес до знань.',
    switchLabel: 'Переключить сайт на русский язык',
    phoneLabel: 'Зателефонувати: +38 067 175 77 73',
    navLabel: 'Основна навігація'
  }
};

const attributeTranslations = {
  '.brand': { attribute: 'aria-label', ru: 'Европейская гимназия', uk: 'Європейська гімназія' },
  '.teacher-tree': { attribute: 'aria-label', ru: 'Учителя Европейской гимназии', uk: 'Вчителі Європейської гімназії' },
  '.teacher-tree__photo': { attribute: 'alt', ru: 'Учителя Европейской гимназии', uk: 'Вчителі Європейської гімназії' },
  '.teacher-portraits': { attribute: 'aria-label', ru: 'Учителя', uk: 'Вчителі' },
  '.teachers-owls': { attribute: 'aria-label', ru: 'Совы', uk: 'Сови' },
  '.stats-widget-card': { attribute: 'aria-label', ru: 'Рейтинг школы по результатам ЗНО', uk: 'Рейтинг школи за результатами ЗНО' },
  '.teachers-video iframe': { attribute: 'title', ru: 'Видео Европейской гимназии', uk: 'Відео Європейської гімназії' },
  '.contact__call>a:last-child': { attribute: 'aria-label', ru: 'Позвонить в Европейскую гимназию', uk: 'Зателефонувати до Європейської гімназії' },
  '.contact-modal__close': { attribute: 'aria-label', ru: 'Закрыть форму', uk: 'Закрити форму' },
  '.route__map iframe': { attribute: 'title', ru: 'Европейская гимназия на карте', uk: 'Європейська гімназія на мапі' },
  '.footer__logo': { attribute: 'aria-label', ru: 'Наверх', uk: 'Нагору' },
  '.footer__to-top': { attribute: 'aria-label', ru: 'Наверх', uk: 'Нагору' },
  '.footer__nav': { attribute: 'aria-label', ru: 'Навигация в подвале', uk: 'Навігація у підвалі' },
  '.footer__socials': { attribute: 'aria-label', ru: 'Социальные сети школы', uk: 'Соціальні мережі школи' },
  '.footer__socials a[href*="instagram"]': { attribute: 'aria-label', ru: 'Instagram Европейской гимназии', uk: 'Instagram Європейської гімназії' },
  '.footer__socials a[href*="youtube"]': { attribute: 'aria-label', ru: 'YouTube Европейской гимназии', uk: 'YouTube Європейської гімназії' }
};

const applyLanguage = language => {
  document.body.dataset.lang = language;
  document.documentElement.lang = language;
  document.title = pageMeta[language].title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', pageMeta[language].description);
  langButton.textContent = language === 'ru' ? 'RU' : 'UA';
  langButton.setAttribute('aria-label', pageMeta[language].switchLabel);
  document.querySelector('.header__phone')?.setAttribute('aria-label', pageMeta[language].phoneLabel);
  nav?.setAttribute('aria-label', pageMeta[language].navLabel);
  document.querySelectorAll('[data-placeholder-ru][data-placeholder-uk]').forEach(field => {
    field.placeholder = field.dataset[`placeholder${language === 'uk' ? 'Uk' : 'Ru'}`] || '';
  });
  Object.entries(attributeTranslations).forEach(([selector, config]) => {
    document.querySelectorAll(selector).forEach(element => {
      element.setAttribute(config.attribute, config[language]);
    });
  });
  localStorage.setItem('site-language', language);
};

const syncHeader = () => header?.classList.toggle('scrolled', scrollY > 20);
addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

menuButton?.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav?.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  header?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  navDropdown?.classList.remove('open');
  navDropdownToggle?.setAttribute('aria-expanded', 'false');
});

navDropdownToggle?.addEventListener('click', event => {
  event.stopPropagation();
  const open = navDropdown.classList.toggle('open');
  navDropdownToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', event => {
  if (!navDropdown || navDropdown.contains(event.target)) return;
  navDropdown.classList.remove('open');
  navDropdownToggle?.setAttribute('aria-expanded', 'false');
});

document.querySelectorAll('a[href="#top"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

applyLanguage(localStorage.getItem('site-language') === 'uk' ? 'uk' : 'ru');

langButton?.addEventListener('click', () => {
  applyLanguage(document.body.dataset.lang === 'ru' ? 'uk' : 'ru');
});

const contactModal = document.querySelector('.contact-modal');
const openContactModal = () => {
  contactModal?.classList.add('is-open');
  contactModal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  contactModal?.querySelector('input[name="name"]')?.focus();
};
const closeContactModal = () => {
  contactModal?.classList.remove('is-open');
  contactModal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

document.querySelectorAll('[data-contact-modal-open]').forEach(button => {
  button.addEventListener('click', openContactModal);
});
document.querySelectorAll('[data-contact-modal-close]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    closeContactModal();
  });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeContactModal();
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const douWidgetData = {
  2021: {
    source: 'https://dou.ua/lenta/articles/zno-widget-2021/?school=1119',
    titleRu: 'Рейтинг школ по результатам ЗНО',
    titleUk: 'Рейтинг шкіл за результатами ЗНО',
    captionRu: 'Карточки с рейтингом в <b>2021 году</b> | 11 143 школы',
    captionUk: 'Картки з рейтингом у <b>2021 році</b> | 11 143 школи',
    metrics: [
      { value: '245', delta: '+21', labelRu: 'Общий рейтинг', labelUk: 'Загальний рейтинг' },
      { value: '195', delta: '+391', labelRu: 'Рейтинг 2021', labelUk: 'Рейтинг 2021', noteRu: 'ср. балл: 165,65', noteUk: 'сер. бал: 165,65' },
      { value: 'Н/Д', muted: true, labelRu: 'Общий IT-рейтинг', labelUk: 'Загальний IT-рейтинг' },
      { value: 'Н/Д', muted: true, labelRu: 'IT-рейтинг 2021', labelUk: 'IT-рейтинг 2021' },
      { value: '100,0%', strong: true, labelRu: '% успешных тестирований', labelUk: '% успішних тестувань', noteRu: '7 выпускников', noteUk: '7 випускників' },
      { value: '731', delta: '+1018', labelRu: 'Математика', labelUk: 'Математика', noteRu: 'ср. балл: 144,17', noteUk: 'сер. бал: 144,17' },
      { value: 'Н/Д', muted: true, labelRu: 'Физика', labelUk: 'Фізика' },
      { value: '31', delta: '+57', labelRu: 'Английский', labelUk: 'Англійська', noteRu: 'ср. балл: 181,86', noteUk: 'сер. бал: 181,86' }
    ]
  },
  2020: {
    source: 'https://dou.ua/lenta/articles/zno-widget-2021/?school=1119',
    titleRu: 'Рейтинг школ по результатам ЗНО',
    titleUk: 'Рейтинг шкіл за результатами ЗНО',
    captionRu: 'Карточки с рейтингом в <b>2020 году</b> | 11 143 школы',
    captionUk: 'Картки з рейтингом у <b>2020 році</b> | 11 143 школи',
    metrics: [
      { value: '266', delta: '-126', labelRu: 'Общий рейтинг', labelUk: 'Загальний рейтинг' },
      { value: '586', delta: '-383', labelRu: 'Рейтинг 2020', labelUk: 'Рейтинг 2020', noteRu: 'ср. балл: 157', noteUk: 'сер. бал: 157' },
      { value: 'Н/Д', muted: true, labelRu: 'Общий IT-рейтинг', labelUk: 'Загальний IT-рейтинг' },
      { value: 'Н/Д', muted: true, labelRu: 'IT-рейтинг 2020', labelUk: 'IT-рейтинг 2020' },
      { value: '100,0%', strong: true, labelRu: '% успешных тестирований', labelUk: '% успішних тестувань', noteRu: '3 выпускника', noteUk: '3 випускника' },
      { value: '1 749', delta: '-1343', labelRu: 'Математика', labelUk: 'Математика', noteRu: 'ср. балл: 140,33', noteUk: 'сер. бал: 140,33' },
      { value: 'Н/Д', muted: true, labelRu: 'Физика', labelUk: 'Фізика' },
      { value: '88', delta: '+17', labelRu: 'Английский', labelUk: 'Англійська' }
    ]
  },
  2019: {
    source: 'https://dou.ua/lenta/articles/zno-widget-2021/?school=1119',
    titleRu: 'Рейтинг школ по результатам ЗНО',
    titleUk: 'Рейтинг шкіл за результатами ЗНО',
    captionRu: 'Карточки с рейтингом в <b>2019 году</b> | 11 143 школы',
    captionUk: 'Картки з рейтингом у <b>2019 році</b> | 11 143 школи',
    metrics: [
      { value: '140', delta: '-55', labelRu: 'Общий рейтинг', labelUk: 'Загальний рейтинг' },
      { value: '203', delta: '↓91', labelRu: 'Рейтинг 2019', labelUk: 'Рейтинг 2019', noteRu: 'ср. балл: 165,6', noteUk: 'сер. бал: 165,6' },
      { value: 'Н/Д', muted: true, labelRu: 'Общий IT-рейтинг', labelUk: 'Загальний IT-рейтинг' },
      { value: 'Н/Д', muted: true, labelRu: 'IT-рейтинг 2019', labelUk: 'IT-рейтинг 2019' },
      { value: '100,0%', strong: true, labelRu: '% успешных тестирований', labelUk: '% успішних тестувань', noteRu: '8 выпускников', noteUk: '8 випускників' },
      { value: '406', delta: '-114', labelRu: 'Математика', labelUk: 'Математика', noteRu: 'ср. балл: 161,6', noteUk: 'сер. бал: 161,6' },
      { value: 'Н/Д', muted: true, labelRu: 'Физика', labelUk: 'Фізика' },
      { value: '105', delta: '+29', labelRu: 'Английский', labelUk: 'Англійська', noteRu: 'ср. балл: 171,83', noteUk: 'сер. бал: 171,83' }
    ]
  },
  2018: {
    source: 'https://dou.ua/lenta/articles/zno-widget-2021/?school=1119',
    titleRu: 'Рейтинг школ по результатам ЗНО',
    titleUk: 'Рейтинг шкіл за результатами ЗНО',
    captionRu: 'Карточки с рейтингом в <b>2018 году</b> | 11 143 школы',
    captionUk: 'Картки з рейтингом у <b>2018 році</b> | 11 143 школи',
    metrics: [
      { value: '105', labelRu: 'Общий рейтинг', labelUk: 'Загальний рейтинг' },
      { value: '112', delta: '↑61', labelRu: 'Рейтинг 2018', labelUk: 'Рейтинг 2018', noteRu: 'ср. балл: 168,4', noteUk: 'сер. бал: 168,4' },
      { value: 'Н/Д', muted: true, labelRu: 'Общий IT-рейтинг', labelUk: 'Загальний IT-рейтинг' },
      { value: 'Н/Д', muted: true, labelRu: 'IT-рейтинг 2018', labelUk: 'IT-рейтинг 2018' },
      { value: '100,0%', strong: true, labelRu: '% успешных тестирований', labelUk: '% успішних тестувань', noteRu: '9 выпускников', noteUk: '9 випускників' },
      { value: '292', delta: '+741', labelRu: 'Математика', labelUk: 'Математика' },
      { value: 'Н/Д', muted: true, labelRu: 'Физика', labelUk: 'Фізика' },
      { value: '134', delta: '-9', labelRu: 'Английский', labelUk: 'Англійська', noteRu: 'ср. балл: 167,22', noteUk: 'сер. бал: 167,22' }
    ]
  },
  2017: {
    source: 'https://dou.ua/lenta/articles/zno-widget-2021/?school=1119',
    titleRu: 'Рейтинг школ по результатам ЗНО',
    titleUk: 'Рейтинг шкіл за результатами ЗНО',
    captionRu: 'Карточки с рейтингом в <b>2017 году</b> | 11 143 школы',
    captionUk: 'Картки з рейтингом у <b>2017 році</b> | 11 143 школи',
    metrics: [
      { value: 'Н/Д', muted: true, labelRu: 'Общий рейтинг', labelUk: 'Загальний рейтинг' },
      { value: '173', labelRu: 'Рейтинг 2017', labelUk: 'Рейтинг 2017', noteRu: 'ср. балл: 164,42', noteUk: 'сер. бал: 164,42' },
      { value: 'Н/Д', muted: true, labelRu: 'Общий IT-рейтинг', labelUk: 'Загальний IT-рейтинг' },
      { value: 'Н/Д', muted: true, labelRu: 'IT-рейтинг 2017', labelUk: 'IT-рейтинг 2017' },
      { value: '100,0%', strong: true, labelRu: '% успешных тестирований', labelUk: '% успішних тестувань', noteRu: '6 выпускников', noteUk: '6 випускників' },
      { value: '1 033', labelRu: 'Математика', labelUk: 'Математика', noteRu: 'ср. балл: 148,33', noteUk: 'сер. бал: 148,33' },
      { value: 'Н/Д', muted: true, labelRu: 'Физика', labelUk: 'Фізика' },
      { value: '125', labelRu: 'Английский', labelUk: 'Англійська', noteRu: 'ср. балл: 168', noteUk: 'сер. бал: 168' }
    ]
  }
};

const douButtons = [...document.querySelectorAll('[data-dou-year]')];
const douMetricGrid = document.querySelector('.stats-widget-card__metrics');
if (douButtons.length && douMetricGrid) {
  const douTitles = {
    ru: document.querySelector('.stats-widget-card__top h4[data-ru]'),
    uk: document.querySelector('.stats-widget-card__top h4[data-uk]')
  };
  const douCaptions = {
    ru: document.querySelector('.stats-widget-card__caption[data-ru]'),
    uk: document.querySelector('.stats-widget-card__caption[data-uk]')
  };
  const douSources = [...document.querySelectorAll('[data-dou-source]')];

  const renderMetric = metric => {
    const classes = [metric.muted ? 'is-muted' : '', metric.strong ? 'is-strong' : ''].filter(Boolean).join(' ');
    const deltaClass = metric.delta && metric.delta.trim().startsWith('-') ? 'is-negative' : '';
    const delta = metric.delta ? `<small class="${deltaClass}">${metric.delta}</small>` : '';
    const note = metric.noteRu || metric.noteUk
      ? `${metric.noteRu ? `<em data-ru>${metric.noteRu}</em>` : ''}${metric.noteUk ? `<em data-uk>${metric.noteUk}</em>` : ''}`
      : (metric.note ? `<em>${metric.note}</em>` : '');
    return `<div class="${classes}"><b>${metric.value}</b>${delta}<span data-ru>${metric.labelRu}</span><span data-uk>${metric.labelUk}</span>${note}</div>`;
  };

  const updateDouWidget = selectedYear => {
    const data = douWidgetData[selectedYear];
    if (!data) return;
    douTitles.ru.innerHTML = data.titleRu;
    douTitles.uk.innerHTML = data.titleUk;
    douCaptions.ru.innerHTML = data.captionRu;
    douCaptions.uk.innerHTML = data.captionUk;
    douSources.forEach(source => { source.href = data.source; });
    douMetricGrid.innerHTML = data.metrics.map(renderMetric).join('');
    douButtons.forEach(button => button.classList.toggle('is-active', button.dataset.douYear === selectedYear));
  };

  douButtons.forEach(button => {
    button.addEventListener('click', () => updateDouWidget(button.dataset.douYear));
  });
}

const statsImageButtons = [...document.querySelectorAll('[data-stats-image]')];
if (statsImageButtons.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'stats-image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = '<button type="button" aria-label="Закрити збільшене зображення">×</button><img alt="">';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('button');

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };

  statsImageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img');
      if (!image) return;
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}
