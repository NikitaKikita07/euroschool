(() => {
  const template = '+38 (___) ___-__-__';
  const maxDigits = 10;

  const getPhoneDigits = value => {
    const digits = value.replace(/\D/g, '');
    return (digits.startsWith('38') ? digits.slice(2) : digits).slice(0, maxDigits);
  };

  const formatPhone = digits => {
    let digitIndex = 0;
    return template.replace(/_/g, () => digits[digitIndex++] ?? '_');
  };

  document.querySelectorAll('input[type="tel"][name="phone"]').forEach(input => {
    const render = digits => {
      input.value = formatPhone(digits);
      const nextSlot = input.value.indexOf('_');
      const caretPosition = nextSlot === -1 ? input.value.length : nextSlot;
      requestAnimationFrame(() => input.setSelectionRange(caretPosition, caretPosition));
    };

    input.addEventListener('focus', () => {
      render(getPhoneDigits(input.value));
    });

    input.addEventListener('input', () => {
      render(getPhoneDigits(input.value));
    });

    input.addEventListener('keydown', event => {
      if (event.key !== 'Backspace' && event.key !== 'Delete') return;
      event.preventDefault();
      render(getPhoneDigits(input.value).slice(0, -1));
    });

    input.addEventListener('blur', () => {
      if (!getPhoneDigits(input.value).length) input.value = '';
    });

    input.form?.addEventListener('reset', () => {
      requestAnimationFrame(() => { input.value = ''; });
    });
  });
})();
