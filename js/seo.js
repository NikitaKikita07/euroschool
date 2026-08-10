(() => {
  const canonicalUrl = new URL(window.location.href);
  canonicalUrl.hash = '';
  canonicalUrl.search = '';

  const pageUrl = canonicalUrl.href;
  const siteUrl = new URL('./', pageUrl).href;
  const logoUrl = new URL('images/school-logo.png', siteUrl).href;
  const imageUrl = new URL('images/search-preview.jpg', siteUrl).href;

  const setLink = (rel, href) => {
    let element = document.querySelector(`link[rel="${rel}"]`);
    if (!element) {
      element = document.createElement('link');
      element.rel = rel;
      document.head.appendChild(element);
    }
    element.href = href;
  };

  const setAlternateLink = (language, href) => {
    let element = document.querySelector(`link[rel="alternate"][hreflang="${language}"]`);
    if (!element) {
      element = document.createElement('link');
      element.rel = 'alternate';
      element.hreflang = language;
      document.head.appendChild(element);
    }
    element.href = href;
  };

  const setMeta = (selector, attribute, value) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      const property = selector.match(/property="([^"]+)"/)?.[1];
      const name = selector.match(/name="([^"]+)"/)?.[1];
      const itemprop = selector.match(/itemprop="([^"]+)"/)?.[1];
      if (property) element.setAttribute('property', property);
      if (name) element.setAttribute('name', name);
      if (itemprop) element.setAttribute('itemprop', itemprop);
      document.head.appendChild(element);
    }
    element.setAttribute(attribute, value);
  };

  setLink('canonical', pageUrl);
  setAlternateLink('uk', pageUrl);
  setAlternateLink('ru', pageUrl);
  setAlternateLink('x-default', pageUrl);
  setLink('image_src', imageUrl);
  setMeta('meta[property="og:url"]', 'content', pageUrl);
  setMeta('meta[property="og:image"]', 'content', imageUrl);
  setMeta('meta[property="og:image:width"]', 'content', '478');
  setMeta('meta[property="og:image:height"]', 'content', '478');
  setMeta('meta[name="twitter:image"]', 'content', imageUrl);
  setMeta('meta[itemprop="image"]', 'content', imageUrl);

  const faq = [...document.querySelectorAll('.faq__item')].map(item => ({
    '@type': 'Question',
    name: item.querySelector('summary b')?.textContent.trim(),
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.querySelector('.faq__answer')?.textContent.trim()
    }
  })).filter(item => item.name && item.acceptedAnswer.text);

  const graph = [
    {
      '@type': ['School', 'EducationalOrganization'],
      '@id': `${siteUrl}#school`,
      name: 'Європейська гімназія',
      alternateName: 'Европейская гимназия',
      url: siteUrl,
      logo: logoUrl,
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
      '@id': `${siteUrl}#website`,
      url: siteUrl,
      name: 'Європейська гімназія',
      inLanguage: ['uk', 'ru'],
      publisher: { '@id': `${siteUrl}#school` }
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: document.title,
      isPartOf: { '@id': `${siteUrl}#website` },
      about: { '@id': `${siteUrl}#school` },
      image: imageUrl,
      thumbnailUrl: imageUrl,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: imageUrl,
        width: 478,
        height: 478
      },
      inLanguage: document.documentElement.lang || document.body.dataset.lang || 'uk'
    }
  ];

  if (faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faq
    });
  }

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph
  });
  document.head.appendChild(script);
})();
