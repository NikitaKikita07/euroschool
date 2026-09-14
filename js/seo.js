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

  const isHomePage = /(?:^|\/)(?:index\.html)?$/.test(canonicalUrl.pathname);
  const organizationId = `${siteUrl}#organization`;
  const websiteId = `${siteUrl}#website`;
  const homepageId = `${siteUrl}#webpage`;

  const graph = [
    {
      '@type': ['School', 'EducationalOrganization'],
      '@id': organizationId,
      name: 'Частная школа «Европейская гимназия» г. Днепр',
      alternateName: [
        'частная школа Европейская гимназия Днепр',
        'Европейская гимназия Днепр',
        'Лицей «Европейская гимназия» с начальной школой город Днепр'
      ],
      url: siteUrl,
      mainEntityOfPage: { '@id': homepageId },
      logo: {
        '@type': 'ImageObject',
        url: logoUrl
      },
      image: imageUrl,
      description: '30+ лет в образовании. 1—11 классы и детский сад. В гимназии — здоровая среда, без вредных привычек для тела и души. Частная школа полного дня в Днепре.',
      telephone: '+380671757773',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Морская, 10',
        addressLocality: 'Днепр',
        addressRegion: 'Днепропетровская область',
        postalCode: '49041',
        addressCountry: 'UA'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 48.441017,
        longitude: 35.055038
      },
      areaServed: {
        '@type': 'City',
        name: 'Днепр'
      },
      openingHoursSpecification: [{
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:30',
        closes: '17:00'
      }],
      sameAs: [
        'https://www.youtube.com/@euroschoolDPua/',
        'https://www.instagram.com/euroschool_dnipro/',
        'https://www.education.ua/schools/lyceum-yevropeiska-himnaziia--dnipro--1779/'
      ],
      knowsAbout: [
        'Частное образование',
        'Частная школа',
        'НУШ',
        'Школа полного дня',
        'Начальное образование'
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Образовательные программы и уровни обучения',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'EducationalOccupationalProgram',
              name: 'Детский сад «Эврика»',
              description: 'Дошкольное образование и бережная подготовка детей к школе.'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'EducationalOccupationalProgram',
              name: 'Начальная школа (1–4 классы)',
              description: 'Развитие эстетических, интеллектуальных и творческих навыков ребёнка с индивидуальным подходом.'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'EducationalOccupationalProgram',
              name: 'Средняя и старшая школа (5–11 классы)',
              description: 'Полное общее среднее образование, новейшие методики, подготовка к НМТ, углублённое изучение языков и проектная деятельность.'
            }
          }
        ]
      },
      amenityFeature: [
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Сертифицированное укрытие',
          value: true,
          description: 'Школа оборудована двумя сертифицированными укрытиями для безопасности учеников.'
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Собственная кухня и столовая',
          value: true,
          description: 'Собственное горячее питание, включая диетическое меню, под контролем врача.'
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Медицинское сопровождение',
          value: true,
          description: 'Ежедневное присутствие квалифицированного врача-педиатра.'
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Интерактивное оборудование',
          value: true,
          description: 'Все классы оснащены современными интерактивными дисплеями Newline.'
        },
        {
          '@type': 'LocationFeatureSpecification',
          name: 'Спортивный и актовый залы',
          value: true,
          description: 'Большое футбольное поле, спортзал с душевыми и актовый зал на 150 мест.'
        }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: siteUrl,
      name: 'Европейская гимназия',
      inLanguage: ['uk', 'ru'],
      publisher: { '@id': organizationId }
    },
    {
      '@type': 'WebPage',
      '@id': isHomePage ? homepageId : `${pageUrl}#webpage`,
      url: pageUrl,
      name: document.title,
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
      image: imageUrl,
      thumbnailUrl: imageUrl,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: imageUrl,
        width: 478,
        height: 478
      },
      inLanguage: document.documentElement.lang || document.body.dataset.lang || 'uk',
      description: isHomePage
        ? '30+ лет в образовании. 1—11 классы и детский сад. В гимназии — здоровая среда, без вредных привычек для тела и души. Частная школа полного дня в Днепре.'
        : document.querySelector('meta[name="description"]')?.content
    }
  ];

  if (isHomePage) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${siteUrl}#faq`,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Какие классы есть в Европейской гимназии?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'У нас действует полный цикл обучения: детский сад «Эврика», начальная школа (1–4 классы), средняя и старшая школа (5–11 классы).'
          }
        },
        {
          '@type': 'Question',
          name: 'Какой график работы и пребывания детей в школе?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Дети находятся в гимназии с 08:30 до 17:00. График включает уроки, прогулки, питание, творческие студии и выполнение домашних заданий с педагогом-консультантом.'
          }
        },
        {
          '@type': 'Question',
          name: 'Как обеспечена безопасность во время воздушных тревог?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Частная школа имеет два собственных сертифицированных укрытия, систему охраны и контроля доступа на территорию.'
          }
        },
        {
          '@type': 'Question',
          name: 'Как организованы питание и медицинский уход?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Частная школа имеет собственную кухню и столовую без заказного кейтеринга, предусмотрено диетическое меню. В учреждении ежедневно дежурит врач-педиатр.'
          }
        }
      ]
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
