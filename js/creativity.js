document.querySelectorAll('[data-creative-gallery]').forEach(gallery => {
  const rows = [...gallery.querySelectorAll('.creative-row')];
  const section = gallery.closest('.creative-section');
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
    rows.forEach(row => row.scrollBy({ left: direction * slideStep(row), behavior: 'smooth' }));
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
