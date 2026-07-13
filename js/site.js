const header = document.querySelector('.header');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');
const heroVideo = document.querySelector('.hero__video');
const navDropdown = document.querySelector('.nav__dropdown');
const navDropdownToggle = document.querySelector('.nav__dropdown-toggle');

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
  button.addEventListener('click', openContactModal);
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
  if (phone.value.replace(/\D/g, '').length < 10) {
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
let openLightbox = null;
photoTracks.forEach(track => {
  const originals = Array.from(track.children);
  if (!originals.length) return;

  originals.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    track.append(clone);
  });
  originals.slice().reverse().forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.tabIndex = -1;
    track.prepend(clone);
  });

  const carousel = track.closest('.photo-carousel');
  const prev = carousel.querySelector('.photo-carousel__arrow--prev');
  const next = carousel.querySelector('.photo-carousel__arrow--next');
  let cycleWidth = 0;
  let dragging = false;
  let startX = 0;
  let startScroll = 0;
  let moved = false;
  let clickLocked = false;
  let normalizeTimer = 0;

  const measure = () => {
    cycleWidth = originals.reduce((sum, item) => sum + item.getBoundingClientRect().width, 0);
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    cycleWidth += gap * originals.length;
    if (track.scrollLeft < cycleWidth * 0.5 || track.scrollLeft > cycleWidth * 1.5) {
      track.scrollLeft = cycleWidth;
    }
  };

  requestAnimationFrame(measure);
  addEventListener('resize', measure, { passive: true });

  const normalize = () => {
    if (!cycleWidth) return;
    if (track.scrollLeft < cycleWidth * 0.35) track.scrollLeft += cycleWidth;
    if (track.scrollLeft > cycleWidth * 1.65) track.scrollLeft -= cycleWidth;
  };

  const scheduleNormalize = () => {
    clearTimeout(normalizeTimer);
    normalizeTimer = setTimeout(normalize, 120);
  };

  const step = () => track.clientWidth * 0.78;
  const moveCarousel = direction => {
    if (clickLocked || !cycleWidth) return;
    clickLocked = true;
    normalize();
    track.scrollTo({ left: track.scrollLeft + direction * step(), behavior: 'smooth' });
    setTimeout(() => {
      clickLocked = false;
      normalize();
    }, 360);
  };

  prev.addEventListener('click', () => moveCarousel(-1));
  next.addEventListener('click', () => moveCarousel(1));
  track.addEventListener('scroll', scheduleNormalize, { passive: true });

  track.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') return;
    if (event.target.closest('[data-lightbox-src]')) return;
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
  });

  const stopDrag = event => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    normalize();
    setTimeout(() => { moved = false; }, 0);
  };

  track.addEventListener('pointerup', stopDrag);
  track.addEventListener('pointercancel', stopDrag);
  track.addEventListener('click', event => {
    if (!moved) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

});

const lightboxTriggers = document.querySelectorAll('[data-lightbox-src]');
if (lightboxTriggers.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.innerHTML = '<button type="button" aria-label="Закрыть">×</button><img alt="">';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const lightboxClose = lightbox.querySelector('button');
  openLightbox = trigger => {
    const image = trigger.querySelector('img');
    const tile = trigger.closest('.photo-tile');
    const tileImage = tile ? tile.querySelector('img') : null;
    lightboxImage.src = trigger.dataset.lightboxSrc;
    lightboxImage.alt = image ? image.alt : tileImage ? tileImage.alt : '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
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

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });
}


const performanceSection = document.querySelector('.video-showcase');
const performancePlayer = performanceSection ? performanceSection.querySelector('#performance-player') : null;
const performanceItems = performanceSection ? performanceSection.querySelectorAll('.performance-item') : [];
const videoPreviews = performanceSection ? performanceSection.querySelectorAll('.video-preview') : [];

if (performancePlayer) {
  const selectVideo = item => {
    const videoId = item.dataset.videoId;
    const videoTitle = item.dataset.videoTitle;

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

  performanceItems.forEach(item => {
    item.addEventListener('click', () => selectVideo(item));
  });

  videoPreviews.forEach(item => {
    item.addEventListener('click', () => selectVideo(item));
  });
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
  ['.section-head, .school-choice__head, .main-idea__inner, .story-split__copy, .faq__intro, .route__content', 'reveal-up'],
  ['.choice-card, .photo-tile, .story-split__media, .owl-spot, .video-showcase__stage, .route__map', 'reveal-scale'],
  ['.performance-item, .video-preview, .learn-card, .tuition-card, .faq__item', 'reveal-up'],
  ['.tuition__note, .footer__hero, .footer__social-inner', 'reveal-fade']
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
