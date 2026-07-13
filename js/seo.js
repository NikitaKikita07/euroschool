(() => {
  const pageUrl = new URL('.', window.location.href).href;
  const imageUrl = new URL('images/school-logo.png', pageUrl).href;

  const setLink = (rel, href) => {
    let element = document.querySelector(`link[rel="${rel}"]`);
    if (!element) {
      element = document.createElement('link');
      element.rel = rel;
      document.head.appendChild(element);
    }
    element.href = href;
  };

  const setMeta = (selector, attribute, value) => {
    const element = document.querySelector(selector);
    if (element) element.setAttribute(attribute, value);
  };

  setLink('canonical', pageUrl);
  setMeta('meta[property="og:image"]', 'content', imageUrl);
  setMeta('meta[name="twitter:image"]', 'content', imageUrl);

  const faq = [...document.querySelectorAll('.faq__item')].map(item => ({
    '@type': 'Question',
    name: item.querySelector('summary b')?.textContent.trim(),
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.querySelector('.faq__answer')?.textContent.trim()
    }
  })).filter(item => item.name && item.acceptedAnswer.text);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['School', 'EducationalOrganization'],
        '@id': `${pageUrl}#school`,
        name: 'Європейська гімназія',
        alternateName: 'Европейская гимназия',
        url: pageUrl,
        logo: imageUrl,
        image: imageUrl,
        description: 'Приватна школа у Дніпрі з навчанням від дитячого садка до 11 класу.',
        telephone: '+380671757773',
        sameAs: [
          'https://www.youtube.com/@euroschoolDPua/videos',
          'https://www.instagram.com/euroschool_dnipro'
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'вул. Морська, 10',
          addressLocality: 'Дніпро',
          addressCountry: 'UA'
        },
        areaServed: {
          '@type': 'City',
          name: 'Дніпро'
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '17:00'
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${pageUrl}#website`,
        url: pageUrl,
        name: 'Європейська гімназія',
        inLanguage: ['uk', 'ru'],
        publisher: { '@id': `${pageUrl}#school` }
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faq
      }
    ]
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
})();
