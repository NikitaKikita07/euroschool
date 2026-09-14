const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const langButton = document.querySelector('.lang-switch');
const navDropdown = document.querySelector('.nav__dropdown');
const navDropdownToggle = document.querySelector('.nav__dropdown-toggle');
const navCollapse = document.querySelector('.nav__collapse');
const mobileNavigation = matchMedia('(max-width: 1100px)');

const setDropdownOpen = open => {
  navDropdown?.classList.toggle('open', open);
  navDropdownToggle?.setAttribute('aria-expanded', String(open));
};

const syncDefaultDropdownState = event => setDropdownOpen(event.matches);
syncDefaultDropdownState(mobileNavigation);
mobileNavigation.addEventListener('change', syncDefaultDropdownState);

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

menuButton?.addEventListener('click', event => {
  event.stopPropagation();
  const open = header.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  if (open && mobileNavigation.matches) setDropdownOpen(true);
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

navCollapse?.addEventListener('click', event => {
  event.stopPropagation();
  header?.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.focus();
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

const statsImageButtons = [...document.querySelectorAll('[data-stats-image]')];
if (statsImageButtons.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'stats-image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = '<button class="stats-image-lightbox__close" type="button" aria-label="Закрити збільшене зображення">×</button><button class="stats-image-lightbox__nav stats-image-lightbox__nav--prev" type="button" aria-label="Попереднє фото">&lt;</button><img alt=""><button class="stats-image-lightbox__nav stats-image-lightbox__nav--next" type="button" aria-label="Наступне фото">&gt;</button>';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.stats-image-lightbox__close');
  const prevButton = lightbox.querySelector('.stats-image-lightbox__nav--prev');
  const nextButton = lightbox.querySelector('.stats-image-lightbox__nav--next');
  let activeIndex = 0;

  const updateLightboxNav = () => {
    if (!lightbox.classList.contains('is-open')) return;
    const rect = lightboxImage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const navGap = 8;
    const navWidth = prevButton.getBoundingClientRect().width || 44;
    const offset = navWidth + navGap;
    lightbox.style.setProperty('--lightbox-nav-left', `${Math.max(10, rect.left - offset)}px`);
    lightbox.style.setProperty('--lightbox-nav-right', `${Math.max(10, window.innerWidth - rect.right - offset)}px`);
  };

  const setLightboxImage = index => {
    activeIndex = (index + statsImageButtons.length) % statsImageButtons.length;
    const image = statsImageButtons[activeIndex].querySelector('img');
    if (!image) return;
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '';
    if (lightboxImage.complete) requestAnimationFrame(updateLightboxNav);
  };

  const moveLightbox = direction => {
    setLightboxImage(activeIndex + direction);
  };

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    document.body.classList.remove('modal-open');
  };

  statsImageButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      setLightboxImage(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      closeButton.focus();
      requestAnimationFrame(updateLightboxNav);
    });
  });

  lightboxImage.addEventListener('load', updateLightboxNav);
  window.addEventListener('resize', updateLightboxNav, { passive: true });
  closeButton.addEventListener('click', closeLightbox);
  prevButton.addEventListener('click', () => moveLightbox(-1));
  nextButton.addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}
