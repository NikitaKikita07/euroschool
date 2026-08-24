const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const heroVideo = document.querySelector('.hero__video');
const navDropdown = document.querySelector('.nav__dropdown');
const navDropdownToggle = document.querySelector('.nav__dropdown-toggle');
const languageSwitch = document.querySelector('.lang-switch');

if (languageSwitch && !window.t) {
  const setStaticLanguage = language => {
    document.documentElement.lang = language;
    document.body.dataset.lang = language;
    languageSwitch.textContent = language === 'uk' ? 'UA' : 'RU';
    languageSwitch.setAttribute(
      'aria-label',
      language === 'uk'
        ? 'Переключить сайт на русский язык'
        : 'Перемкнути сайт українською мовою'
    );
    document.querySelectorAll('[data-placeholder-ru],[data-placeholder-uk]').forEach(element => {
      const value = element.dataset[`placeholder${language === 'uk' ? 'Uk' : 'Ru'}`];
      if (value) element.setAttribute('placeholder', value);
    });
    document.querySelectorAll('[data-aria-label-ru],[data-aria-label-uk]').forEach(element => {
      const value = element.dataset[`ariaLabel${language === 'uk' ? 'Uk' : 'Ru'}`];
      if (value) element.setAttribute('aria-label', value);
    });
    document.querySelectorAll('[data-title-ru],[data-title-uk]').forEach(element => {
      const value = element.dataset[`title${language === 'uk' ? 'Uk' : 'Ru'}`];
      if (value) element.setAttribute('title', value);
    });
    document.querySelectorAll('[data-alt-ru],[data-alt-uk]').forEach(element => {
      const value = element.dataset[`alt${language === 'uk' ? 'Uk' : 'Ru'}`];
      if (value) element.setAttribute('alt', value);
    });
    localStorage.setItem('site-language', language);
    window.siteLanguage = language;
  };

  const preferredLanguage = localStorage.getItem('site-language');
  if (preferredLanguage === 'ru' || preferredLanguage === 'uk') {
    setStaticLanguage(preferredLanguage);
  } else {
    setStaticLanguage(document.body.dataset.lang === 'ru' ? 'ru' : 'uk');
  }

  languageSwitch.addEventListener('click', () => {
    setStaticLanguage(document.body.dataset.lang === 'uk' ? 'ru' : 'uk');
  });
}

const startHeroVideo = () => {
  if (!heroVideo || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  heroVideo.play().catch(() => {});
};

if ('requestIdleCallback' in window) {
  requestIdleCallback(startHeroVideo, { timeout: 1200 });
} else {
  setTimeout(startHeroVideo, 450);
}

const syncHeader = () => header.classList.toggle('scrolled', scrollY > 20);
addEventListener('scroll', syncHeader, { passive: true });
syncHeader();

menuButton.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

nav.addEventListener('click', event => {
  if (event.target.closest('a')) {
    header.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
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

document.querySelectorAll('a[href="#top"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

const form = document.querySelector('.contact-form');
const contactModal = document.querySelector('.contact-modal');
const openContactModalButtons = document.querySelectorAll('[data-contact-modal-open]');
const closeContactModalButtons = document.querySelectorAll('[data-contact-modal-close]');

const closeContactModal = () => {
  if (!contactModal) return;
  contactModal.classList.remove('is-open');
  contactModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
};

const openContactModal = () => {
  if (!contactModal) return;
  contactModal.classList.add('is-open');
  contactModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  form?.elements.name?.focus();
};

openContactModalButtons.forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    openContactModal();
  });
});

closeContactModalButtons.forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    closeContactModal();
  });
});

contactModal?.addEventListener('click', event => {
  if (!event.target.closest('[data-contact-modal-close]')) return;
  event.preventDefault();
  closeContactModal();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeContactModal();
});

form?.addEventListener('submit', async event => {
  event.preventDefault();
  const name = form.elements.name;
  const phone = form.elements.phone;
  const submitButton = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');
  let valid = true;
  form.querySelectorAll('label small').forEach(item => item.textContent = '');
  status.textContent = '';

  if (name.value.trim().length < 2) {
    name.nextElementSibling.textContent = window.t('Укажите имя');
    valid = false;
  }
  if (phone.value.replace(/\D/g, '').length < 12) {
    phone.nextElementSibling.textContent = window.t('Укажите корректный номер телефона');
    valid = false;
  }
  if (!valid) return;

  const isUkrainian = document.documentElement.lang === 'uk';
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  submitButton.textContent = isUkrainian ? 'Надсилаємо…' : 'Отправляем…';
  status.textContent = isUkrainian ? 'Надсилаємо заявку…' : 'Отправляем заявку…';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) throw new Error(`FormSubmit returned ${response.status}`);

    status.textContent = isUkrainian
      ? 'Дякуємо! Заявку надіслано. Ми зв’яжемося з вами.'
      : 'Спасибо! Заявка отправлена. Мы свяжемся с вами.';
    form.reset();
  } catch (error) {
    console.error('Form submission failed:', error);
    status.textContent = isUkrainian
      ? 'Не вдалося надіслати заявку. Зателефонуйте нам: +38 (067) 175-77-73.'
      : 'Не удалось отправить заявку. Позвоните нам: +38 (067) 175-77-73.';
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
    submitButton.innerHTML = originalButtonText;
  }
});

document.getElementById('year').textContent = new Date().getFullYear();

const photoTracks = document.querySelectorAll('.photo-grid');

const getGraduatesMediaTrackForArrow = button => {
  if (button.classList.contains('graduates-insta-card__media-arrow--prev')) {
    return button.previousElementSibling?.classList.contains('graduates-insta-card__media-track')
      ? button.previousElementSibling
      : null;
  }
  const track = button.previousElementSibling?.previousElementSibling;
  return track?.classList.contains('graduates-insta-card__media-track') ? track : null;
};

const graduatesMediaLoops = new WeakMap();

const moveGraduatesMediaTrack = (track, direction) => {
  const loop = graduatesMediaLoops.get(track);
  if (loop) {
    loop.normalize();
    loop.move(direction);
    return;
  }

  const max = Math.max(0, track.scrollWidth - track.clientWidth);
  const atStart = track.scrollLeft <= 2;
  const atEnd = track.scrollLeft >= max - 2;
  const target = direction < 0 && atStart
    ? max
    : direction > 0 && atEnd
      ? 0
      : Math.max(0, Math.min(max, track.scrollLeft + direction * track.clientWidth));
  track.scrollTo({ left: target, behavior: 'smooth' });
};

let lastGraduatesMediaArrowActivation = 0;
let suppressGraduatesMediaArrowClick = false;
const handleGraduatesMediaArrowActivation = event => {
  const target = event.target instanceof Element ? event.target : event.target.parentElement;
  const button = target?.closest('.graduates-insta-card__media-arrow');
  if (!button) return;
  if (event.type === 'click' && suppressGraduatesMediaArrowClick) {
    event.preventDefault();
    event.stopPropagation();
    suppressGraduatesMediaArrowClick = false;
    return;
  }
  const track = getGraduatesMediaTrackForArrow(button);
  if (!track) return;
  event.preventDefault();
  event.stopPropagation();
  lastGraduatesMediaArrowActivation = Date.now();
  suppressGraduatesMediaArrowClick = event.type === 'pointerdown';
  moveGraduatesMediaTrack(track, button.classList.contains('graduates-insta-card__media-arrow--next') ? 1 : -1);
};

document.addEventListener('pointerdown', handleGraduatesMediaArrowActivation, true);
document.addEventListener('click', handleGraduatesMediaArrowActivation, true);
let openLightbox = null;

document.querySelectorAll('.photo-tile, .placeholder-tile').forEach(tile => {
  const image = tile.querySelector('img');
  if (!image || tile.querySelector('[data-lightbox-src]')) return;
  const button = document.createElement('button');
  button.className = 'photo-tile__zoom';
  button.type = 'button';
  button.dataset.lightboxSrc = image.getAttribute('src') || image.currentSrc || image.src;
  button.setAttribute('aria-label', document.body.dataset.lang === 'ru' ? 'Увеличить фото' : 'Збільшити фото');
  tile.append(button);
});

const setupSeamlessCarousel = (track, options = {}) => {
  const originals = Array.from(track.children);
  if (originals.length < 2) return null;

  const makeClones = () => originals.map(item => {
    const clone = item.cloneNode(true);
    clone.dataset.loopClone = 'true';
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a,button,input,textarea,select,iframe,[tabindex]').forEach(element => {
      element.setAttribute('tabindex', '-1');
    });
    return clone;
  });

  track.prepend(...makeClones());
  track.append(...makeClones());

  const firstOriginal = originals[0];
  const firstAfterOriginals = originals[originals.length - 1].nextElementSibling;

  const measure = () => ({
    start: firstOriginal.offsetLeft,
    width: Math.max(0, firstAfterOriginals.offsetLeft - firstOriginal.offsetLeft)
  });

  const normalize = () => {
    const { start, width } = measure();
    if (!width) return;
    const left = track.scrollLeft;
    if (left < start - width * 0.65) track.scrollLeft = left + width;
    if (left > start + width * 0.65) track.scrollLeft = left - width;
  };

  let normalizeFrame = 0;
  const scheduleNormalize = () => {
    cancelAnimationFrame(normalizeFrame);
    normalizeFrame = requestAnimationFrame(normalize);
  };

  const firstSlide = () => track.querySelector(':scope > :not([data-loop-clone])') || track.firstElementChild;
  const defaultStep = () => {
    const slide = firstSlide();
    if (!slide) return track.clientWidth * 0.85;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return slide.getBoundingClientRect().width + gap;
  };

  const move = direction => {
    track.scrollTo({ left: track.scrollLeft + direction * (options.step?.(track) || defaultStep()), behavior: 'smooth' });
    window.setTimeout(scheduleNormalize, 380);
  };

  requestAnimationFrame(() => {
    track.scrollLeft = measure().start;
  });
  addEventListener('resize', scheduleNormalize, { passive: true });
  track.addEventListener('scroll', scheduleNormalize, { passive: true });

  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;

  track.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') return;
    if (options.ignorePointerDown?.(event)) return;
    dragging = true;
    moved = false;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', event => {
    if (!dragging) return;
    const distance = event.clientX - startX;
    if (Math.abs(distance) > 6) moved = true;
    track.scrollLeft = startScroll - distance;
    scheduleNormalize();
  });

  const stopDrag = event => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    scheduleNormalize();
    setTimeout(() => { moved = false; }, 0);
  };

  track.addEventListener('pointerup', stopDrag);
  track.addEventListener('pointercancel', stopDrag);
  track.addEventListener('click', event => {
    if (!moved) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  return { move, normalize };
};

photoTracks.forEach(track => {
  const carousel = track.closest('.photo-carousel');
  const prev = carousel?.querySelector('.photo-carousel__arrow--prev');
  const next = carousel?.querySelector('.photo-carousel__arrow--next');
  if (!prev || !next) return;

  let clickLocked = false;
  const loop = setupSeamlessCarousel(track, {
    step: () => track.clientWidth * 0.78,
    ignorePointerDown: event => event.target.closest('[data-lightbox-src]')
  });
  if (!loop) return;

  const moveCarousel = direction => {
    if (clickLocked) return;
    clickLocked = true;
    loop.normalize();
    loop.move(direction);
    setTimeout(() => {
      clickLocked = false;
      loop.normalize();
    }, 360);
  };

  prev.addEventListener('click', () => moveCarousel(-1));
  next.addEventListener('click', () => moveCarousel(1));
});

document.querySelectorAll('.graduates-carousel').forEach(carousel => {
  const track = carousel.querySelector('.graduates-carousel__track');
  const prev = carousel.closest('.graduates')?.querySelector('.graduates-carousel__arrow--prev');
  const next = carousel.closest('.graduates')?.querySelector('.graduates-carousel__arrow--next');
  if (!track || !prev || !next) return;

  const loop = setupSeamlessCarousel(track, {
    ignorePointerDown: event => event.target.closest('.graduates-insta-card__media-track, .graduates-insta-card__media-track img, a')
  });
  if (!loop) return;

  const moveGraduatesCarousel = direction => {
    loop.move(direction);
  };

  carousel.addEventListener('graduatesOuterMove', event => {
    moveGraduatesCarousel(event.detail?.direction || 1);
  });

  prev.addEventListener('click', () => moveGraduatesCarousel(-1));
  next.addEventListener('click', () => moveGraduatesCarousel(1));
});

document.querySelectorAll('.graduates-insta-card__media-track').forEach(track => {
  if (track.children.length < 2) return;

  const prevButton = document.createElement('button');
  const nextButton = document.createElement('button');
  prevButton.className = 'graduates-insta-card__media-arrow graduates-insta-card__media-arrow--prev';
  nextButton.className = 'graduates-insta-card__media-arrow graduates-insta-card__media-arrow--next';
  prevButton.type = 'button';
  nextButton.type = 'button';
  prevButton.setAttribute('aria-label', 'Попереднє фото');
  nextButton.setAttribute('aria-label', 'Наступне фото');
  prevButton.textContent = '‹';
  nextButton.textContent = '›';
  track.after(prevButton, nextButton);

  const loop = setupSeamlessCarousel(track, {
    step: () => track.clientWidth,
    ignorePointerDown: event => event.target.closest('a, button')
  });
  if (loop) graduatesMediaLoops.set(track, loop);
});

const lightboxTriggers = document.querySelectorAll('[data-lightbox-src]');
if (lightboxTriggers.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.innerHTML = '<button class="lightbox__close" type="button" aria-label="Закрыть">×</button><button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Предыдущее фото">&lt;</button><img alt=""><button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Следующее фото">&gt;</button>';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('.lightbox__close');
  const lightboxPrev = lightbox.querySelector('.lightbox__nav--prev');
  const lightboxNext = lightbox.querySelector('.lightbox__nav--next');
  let activeTriggers = [];
  let activeIndex = 0;

  const updateLightboxNav = () => {
    if (!lightbox.classList.contains('is-open')) return;
    const rect = lightboxImage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const navGap = 8;
    const navWidth = lightboxPrev.getBoundingClientRect().width || 44;
    const offset = navWidth + navGap;
    lightbox.style.setProperty('--lightbox-nav-left', `${Math.max(10, rect.left - offset)}px`);
    lightbox.style.setProperty('--lightbox-nav-right', `${Math.max(10, innerWidth - rect.right - offset)}px`);
  };

  const setLightboxImage = index => {
    if (!activeTriggers.length) return;
    activeIndex = (index + activeTriggers.length) % activeTriggers.length;
    const trigger = activeTriggers[activeIndex];
    const image = trigger.querySelector('img');
    const tile = trigger.closest('.photo-tile, .placeholder-tile');
    const tileImage = tile ? tile.querySelector('img') : null;
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = image ? image.alt : tileImage ? tileImage.alt : '';
    if (lightboxImage.complete) requestAnimationFrame(updateLightboxNav);
  };

  const moveLightbox = direction => {
    setLightboxImage(activeIndex + direction);
  };

  openLightbox = trigger => {
    const gallery = trigger.closest('.photo-carousel, .tile-grid, .photo-gallery, .tile-gallery, .section') || document;
    activeTriggers = [...gallery.querySelectorAll('[data-lightbox-src]')].filter(item => !item.closest('[data-loop-clone]'));
    const directIndex = activeTriggers.indexOf(trigger);
    const startIndex = directIndex >= 0 ? directIndex : activeTriggers.findIndex(item => item.dataset.lightboxSrc === trigger.dataset.lightboxSrc);
    setLightboxImage(Math.max(0, startIndex));
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
    requestAnimationFrame(updateLightboxNav);
  };
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightboxImage.removeAttribute('src');
    document.body.style.overflow = '';
  };

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-lightbox-src]');
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    openLightbox(trigger);
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const trigger = event.target.closest('[data-lightbox-src]');
    if (!trigger) return;
    event.preventDefault();
    openLightbox(trigger);
  });

  lightboxImage.addEventListener('load', updateLightboxNav);
  addEventListener('resize', updateLightboxNav, { passive: true });
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => moveLightbox(-1));
  lightboxNext.addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  addEventListener('keydown', event => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
}


const performanceSection = document.querySelector('.video-showcase');
const performancePlayer = performanceSection ? performanceSection.querySelector('#performance-player') : null;
const performanceItems = performanceSection ? performanceSection.querySelectorAll('.performance-item') : [];
const videoPreviews = performanceSection ? performanceSection.querySelectorAll('.video-preview') : [];

if (performancePlayer) {
  const getVideoTitle = item => {
    const language = document.body.dataset.lang === 'ru' ? 'ru' : 'uk';
    return item.dataset[`videoTitle${language === 'ru' ? 'Ru' : 'Uk'}`] || item.dataset.videoTitle || 'Видео';
  };

  const selectVideo = item => {
    const videoId = item.dataset.videoId;
    const videoTitle = getVideoTitle(item);

    performanceItems.forEach(button => {
      const selected = button === item;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    videoPreviews.forEach(button => {
      button.classList.toggle('active', button.dataset.videoId === videoId);
    });

    performancePlayer.title = videoTitle;
    performancePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`;
    performancePlayer.dataset.src = performancePlayer.src;
  };

  const syncActiveVideoTitle = () => {
    const activeItem = performanceSection.querySelector('.performance-item.active');
    if (activeItem) performancePlayer.title = getVideoTitle(activeItem);
  };

  performanceItems.forEach(item => {
    item.addEventListener('click', () => selectVideo(item));
  });

  videoPreviews.forEach(item => {
    item.addEventListener('click', () => selectVideo(item));
  });

  document.querySelector('.lang-switch')?.addEventListener('click', () => {
    setTimeout(syncActiveVideoTitle, 0);
  });

  syncActiveVideoTitle();
}

const faqItems = document.querySelectorAll('.faq__item');
faqItems.forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach(otherItem => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

// Scroll reveal animations
document.documentElement.classList.add('motion-ready');

const revealGroups = [
  ['.section-head, .school-choice__head, .main-idea__inner, .story-split__copy, .faq__intro, .route__content, .graduates__head', 'reveal-up'],
  ['.choice-card, .photo-tile, .story-split__media, .owl-spot, .video-showcase__stage, .route__map', 'reveal-scale'],
  ['.performance-item, .video-preview, .learn-card, .tuition-card, .faq__item, .graduates-post', 'reveal-up'],
  ['.tuition__note, .footer__hero', 'reveal-fade']
];

const revealElements = [];
revealGroups.forEach(([selector, animationClass]) => {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.classList.add('reveal', animationClass);
    element.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 70}ms`);
    revealElements.push(element);
  });
});

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealElements.forEach(element => revealObserver.observe(element));
} else {
  revealElements.forEach(element => element.classList.add('is-visible'));
}

const storySplits = document.querySelectorAll('.story-split');
if ('IntersectionObserver' in window && storySplits.length) {
  const storyPhotoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('story-split--photo-cycle-active', entry.isIntersecting);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.18 });

  storySplits.forEach(section => storyPhotoObserver.observe(section));
} else {
  storySplits.forEach(section => section.classList.add('story-split--photo-cycle-active'));
}
