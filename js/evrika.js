const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const langButton = document.querySelector('.lang-switch');
const navDropdown = document.querySelector('.nav__dropdown');
const navDropdownToggle = document.querySelector('.nav__dropdown-toggle');
const titleByLanguage = {
  uk: 'Дитячий сад Еврика | Європейська гімназія Дніпро',
  ru: 'Детский сад Эврика | Европейская гимназия Днепр'
};
const descriptionByLanguage = {
  uk: 'Дитячий сад Еврика на базі Європейської гімназії у Дніпрі. Гра, розвиток, творчість, турбота та м’яка підготовка до школи.',
  ru: 'Детский сад Эврика на базе Европейской гимназии в Днепре. Игра, развитие, творчество, забота и мягкая подготовка к школе.'
};
const attributeTranslations = {
  '.menu-button .sr-only': { text: { uk: 'Відкрити меню', ru: 'Открыть меню' } },
  '.nav': { attribute: 'aria-label', uk: 'Основна навігація', ru: 'Основная навигация' },
  '.header__phone': { attribute: 'aria-label', uk: 'Зателефонувати: +38 067 175 77 73', ru: 'Позвонить: +38 067 175 77 73' },
  '.hero__socials': { attribute: 'aria-label', uk: 'Соціальні мережі садка', ru: 'Социальные сети детского сада' },
  '.hero__scroll': { attribute: 'aria-label', uk: 'Прокрутити до опису садка', ru: 'Прокрутить к описанию детского сада' },
  '.contact__call a': { attribute: 'aria-label', uk: 'Зателефонувати до дитячого садка Еврика', ru: 'Позвонить в детский сад Эврика' },
  '.contact-modal__close': { attribute: 'aria-label', uk: 'Закрити форму', ru: 'Закрыть форму' },
  '.footer__logo': { attribute: 'aria-label', uk: 'Повернутися нагору', ru: 'Вернуться наверх' },
  '.footer__to-top': { attribute: 'aria-label', uk: 'Повернутися нагору', ru: 'Вернуться наверх' },
  '.footer__nav': { attribute: 'aria-label', uk: 'Навігація у підвалі', ru: 'Навигация в подвале' },
  '.footer__socials': { attribute: 'aria-label', uk: 'Соціальні мережі школи', ru: 'Социальные сети школы' },
  '.footer__socials a[href*="instagram"]': { attribute: 'aria-label', uk: 'Instagram Європейської гімназії', ru: 'Instagram Европейской гимназии' },
  '.footer__socials a[href*="youtube"]': { attribute: 'aria-label', uk: 'YouTube Європейської гімназії', ru: 'YouTube Европейской гимназии' }
};

const applyLanguage = (language) => {
  document.body.dataset.lang = language;
  document.documentElement.lang = language;
  document.title = titleByLanguage[language];
  document.querySelector('meta[name="description"]')?.setAttribute('content', descriptionByLanguage[language]);
  if (langButton) {
    langButton.textContent = language === 'uk' ? 'UA' : 'RU';
    langButton.setAttribute('aria-label', language === 'uk' ? 'Переключить сайт на русский язык' : 'Перемкнути сайт українською мовою');
  }
  document.querySelectorAll('[data-placeholder-ru][data-placeholder-uk]').forEach((field) => {
    field.placeholder = field.dataset[`placeholder${language === 'uk' ? 'Uk' : 'Ru'}`] || '';
  });
  Object.entries(attributeTranslations).forEach(([selector, config]) => {
    document.querySelectorAll(selector).forEach((element) => {
      if (config.attribute) {
        element.setAttribute(config.attribute, config[language]);
      } else if (config.text) {
        element.textContent = config.text[language];
      }
    });
  });
  document.querySelectorAll('.photo-carousel__arrow--prev').forEach((button) => {
    button.setAttribute('aria-label', language === 'uk' ? 'Попередні фотографії' : 'Предыдущие фотографии');
  });
  document.querySelectorAll('.photo-carousel__arrow--next').forEach((button) => {
    button.setAttribute('aria-label', language === 'uk' ? 'Наступні фотографії' : 'Следующие фотографии');
  });
  document.querySelectorAll('.photo-tile__zoom').forEach((button) => {
    button.setAttribute('aria-label', language === 'uk' ? 'Збільшити фото' : 'Увеличить фото');
  });
  localStorage.setItem('site-language', language);
};

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  header?.classList.toggle('open', !expanded);
});

nav?.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    menuButton?.setAttribute('aria-expanded', 'false');
    header?.classList.remove('open');
    navDropdown?.classList.remove('open');
    navDropdownToggle?.setAttribute('aria-expanded', 'false');
  }
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

applyLanguage(localStorage.getItem('site-language') === 'ru' ? 'ru' : 'uk');

langButton?.addEventListener('click', () => {
  applyLanguage(document.body.dataset.lang === 'ru' ? 'uk' : 'ru');
});

const setupLoopedCarousel = (carousel) => {
  const grid = carousel.querySelector('.photo-grid');
  const prev = carousel.querySelector('.photo-carousel__arrow--prev');
  const next = carousel.querySelector('.photo-carousel__arrow--next');
  if (!grid || !prev || !next) return;

  const originals = Array.from(grid.children);
  if (!originals.length) return;

  originals.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    grid.append(clone);
  });
  originals.slice().reverse().forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    grid.prepend(clone);
  });

  let cycleWidth = 0;
  let normalizeTimer = 0;

  const measure = () => {
    const gap = Number.parseFloat(getComputedStyle(grid).columnGap || getComputedStyle(grid).gap) || 0;
    cycleWidth = originals.reduce((sum, item) => sum + item.getBoundingClientRect().width, 0) + gap * originals.length;
    if (cycleWidth > 0 && (grid.scrollLeft < cycleWidth * 0.5 || grid.scrollLeft > cycleWidth * 1.5)) {
      grid.scrollLeft = cycleWidth;
    }
  };

  const normalize = () => {
    if (!cycleWidth) return;
    if (grid.scrollLeft < cycleWidth * 0.35) grid.scrollLeft += cycleWidth;
    if (grid.scrollLeft > cycleWidth * 1.65) grid.scrollLeft -= cycleWidth;
  };

  const scheduleNormalize = () => {
    clearTimeout(normalizeTimer);
    normalizeTimer = setTimeout(normalize, 120);
  };

  const step = () => Math.max(260, Math.round(grid.clientWidth * 0.72));
  const moveCarousel = (direction) => {
    normalize();
    grid.scrollTo({ left: grid.scrollLeft + direction * step(), behavior: 'smooth' });
    setTimeout(normalize, 380);
  };

  requestAnimationFrame(measure);
  window.addEventListener('resize', measure, { passive: true });
  grid.addEventListener('scroll', scheduleNormalize, { passive: true });
  prev.addEventListener('click', () => moveCarousel(-1));
  next.addEventListener('click', () => moveCarousel(1));
};

document.querySelectorAll('.photo-carousel').forEach(setupLoopedCarousel);

const evrikaPlayer = document.getElementById('evrika-player');

const getEvrikaVideoTitle = (item) => {
  const language = document.body.dataset.lang === 'ru' ? 'ru' : 'uk';
  return item.dataset[`videoTitle${language === 'ru' ? 'Ru' : 'Uk'}`] || item.dataset.videoTitle || 'Видео';
};

const syncEvrikaVideoTitle = () => {
  const activeItem = document.querySelector('.performance-item.active');
  if (activeItem && evrikaPlayer) evrikaPlayer.title = getEvrikaVideoTitle(activeItem);
};

document.querySelectorAll('.performance-item').forEach((item) => {
  item.addEventListener('click', () => {
    const videoId = item.dataset.videoId;

    if (!videoId || !evrikaPlayer) return;

    evrikaPlayer.src = `https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`;
    evrikaPlayer.title = item.dataset.videoTitle || 'Видео';
    evrikaPlayer.title = getEvrikaVideoTitle(item);

    document.querySelectorAll('.performance-item').forEach((button) => {
      const active = button === item;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  });
});

langButton?.addEventListener('click', () => {
  setTimeout(syncEvrikaVideoTitle, 0);
});

syncEvrikaVideoTitle();

const modal = document.querySelector('.contact-modal');
const openModal = () => {
  modal?.classList.add('is-open');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  modal?.querySelector('input[name="name"]')?.focus();
};
const closeModal = () => {
  modal?.classList.remove('is-open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

document.querySelectorAll('[data-contact-modal-open]').forEach((button) => button.addEventListener('click', (event) => {
  event.preventDefault();
  openModal();
}));
document.querySelectorAll('[data-contact-modal-close]').forEach((button) => button.addEventListener('click', (event) => {
  event.preventDefault();
  closeModal();
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeModal();
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
