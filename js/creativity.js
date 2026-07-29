document.querySelectorAll('[data-creative-gallery]').forEach(gallery => {
  const rows = [...gallery.querySelectorAll('.creative-row')];
  const section = gallery.closest('.project-gallery') || gallery.closest('.creative-section');
  const prev = section?.querySelector('[data-row-prev]');
  const next = section?.querySelector('[data-row-next]');
  if (!rows.length || !prev || !next) return;

  const slideStep = row => {
    const item = row.firstElementChild;
    if (!item) return row.clientWidth * 0.85;
    const gap = Number.parseFloat(getComputedStyle(row).gap) || 0;
    return item.getBoundingClientRect().width + gap;
  };

  const moveRows = direction => {
    rows.forEach(row => {
      const maxScroll = Math.max(0, row.scrollWidth - row.clientWidth);
      const edgeOffset = 8;
      let target = row.scrollLeft + direction * slideStep(row);
      if (direction < 0 && row.scrollLeft <= edgeOffset) target = maxScroll;
      if (direction > 0 && row.scrollLeft >= maxScroll - edgeOffset) target = 0;
      row.scrollTo({ left: Math.max(0, Math.min(maxScroll, target)), behavior: 'smooth' });
    });
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
    });

    const stopDrag = event => {
      if (!dragging) return;
      dragging = false;
      row.classList.remove('is-dragging');
      if (row.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId);
      setTimeout(() => { moved = false; }, 0);
    };

    row.addEventListener('pointerup', stopDrag);
    row.addEventListener('pointercancel', stopDrag);
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
  lightbox.innerHTML = '<button type="button" aria-label="Закрити збільшене зображення">×</button><img alt="">';
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('button');

  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  projectImages.forEach(image => {
    image.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') event.stopPropagation();
    });

    image.addEventListener('click', () => {
      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
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
