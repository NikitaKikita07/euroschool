document.querySelectorAll('[data-creative-gallery]').forEach(gallery => {
  const rows = [...gallery.querySelectorAll('.creative-row')];
  const section = gallery.closest('.project-gallery') || gallery.closest('.creative-section');
  const prev = section?.querySelector('[data-row-prev]');
  const next = section?.querySelector('[data-row-next]');
  if (!rows.length || !prev || !next) return;

  const slideStep = row => {
    const item = row.querySelector(':scope > :not([data-loop-clone])') || row.firstElementChild;
    if (!item) return row.clientWidth * 0.85;
    const gap = Number.parseFloat(getComputedStyle(row).gap) || 0;
    return item.getBoundingClientRect().width + gap;
  };

  const setupLoop = row => {
    const originals = [...row.children];
    if (originals.length < 2) return null;

    const cloneItems = () => originals.map(item => {
      const clone = item.cloneNode(true);
      clone.dataset.loopClone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a,button,input,textarea,select,iframe,[tabindex]').forEach(element => {
        element.setAttribute('tabindex', '-1');
      });
      return clone;
    });

    row.prepend(...cloneItems());
    row.append(...cloneItems());

    const firstOriginal = originals[0];
    const firstAfterClone = originals[originals.length - 1].nextElementSibling;
    const measure = () => ({
      start: firstOriginal.offsetLeft,
      width: Math.max(0, firstAfterClone.offsetLeft - firstOriginal.offsetLeft)
    });

    const normalize = () => {
      const { start, width } = measure();
      if (!width) return;
      const left = row.scrollLeft;
      if (left < start - width * 0.65) row.scrollLeft = left + width;
      if (left > start + width * 0.65) row.scrollLeft = left - width;
    };

    requestAnimationFrame(() => {
      row.scrollLeft = measure().start;
    });

    return normalize;
  };

  const normalizers = rows.map(setupLoop).filter(Boolean);
  let normalizeFrame = 0;
  const scheduleNormalize = () => {
    cancelAnimationFrame(normalizeFrame);
    normalizeFrame = requestAnimationFrame(() => normalizers.forEach(normalize => normalize()));
  };

  const moveRows = direction => {
    rows.forEach(row => {
      let target = row.scrollLeft + direction * slideStep(row);
      row.scrollTo({ left: target, behavior: 'smooth' });
    });
    window.setTimeout(scheduleNormalize, 380);
  };

  prev.addEventListener('click', () => moveRows(-1));
  next.addEventListener('click', () => moveRows(1));

  rows.forEach(row => {
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    row.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') return;
      dragging = true;
      moved = false;
      startX = event.clientX;
      startScroll = row.scrollLeft;
      row.classList.add('is-dragging');
      row.setPointerCapture(event.pointerId);
    });

    row.addEventListener('pointermove', event => {
      if (!dragging) return;
      const distance = event.clientX - startX;
      if (Math.abs(distance) > 6) moved = true;
      row.scrollLeft = startScroll - distance;
      scheduleNormalize();
    });

    const stopDrag = event => {
      if (!dragging) return;
      dragging = false;
      row.classList.remove('is-dragging');
      if (row.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId);
      scheduleNormalize();
      setTimeout(() => { moved = false; }, 0);
    };

    row.addEventListener('pointerup', stopDrag);
    row.addEventListener('pointercancel', stopDrag);
    row.addEventListener('scroll', scheduleNormalize, { passive: true });
    row.addEventListener('click', event => {
      if (!moved) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  });
});

const projectImages = [...document.querySelectorAll('.project-gallery:not([aria-labelledby="project-general-title"]) .vertical-photo img')];
if (projectImages.length) {
  const lightbox = document.createElement('div');
  lightbox.className = 'project-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = '<button class="project-lightbox__close" type="button" aria-label="Закрити збільшене зображення">×</button><button class="project-lightbox__nav project-lightbox__nav--prev" type="button" aria-label="Попереднє фото">&lt;</button><img alt=""><button class="project-lightbox__nav project-lightbox__nav--next" type="button" aria-label="Наступне фото">&gt;</button>';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.project-lightbox__close');
  const prevButton = lightbox.querySelector('.project-lightbox__nav--prev');
  const nextButton = lightbox.querySelector('.project-lightbox__nav--next');
  let activeImages = [];
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
    if (!activeImages.length) return;
    activeIndex = (index + activeImages.length) % activeImages.length;
    const image = activeImages[activeIndex];
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
    document.body.style.overflow = '';
  };

  projectImages.forEach(image => {
    image.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') event.stopPropagation();
    });

    image.addEventListener('click', () => {
      const gallery = image.closest('.project-gallery');
      activeImages = [...gallery.querySelectorAll('.vertical-photo:not([data-loop-clone]) img')];
      const imageSrc = image.getAttribute('src');
      const startIndex = activeImages.findIndex(item => item.getAttribute('src') === imageSrc);
      setLightboxImage(Math.max(0, startIndex));
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
      requestAnimationFrame(updateLightboxNav);
    });
  });

  lightboxImage.addEventListener('load', updateLightboxNav);
  window.addEventListener('resize', updateLightboxNav);
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
