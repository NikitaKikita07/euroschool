"""Static Schema.org data built from page metadata and visible FAQ answers."""
import json
from html.parser import HTMLParser


class VisibleFAQ(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.items = []
        self.current = None
        self.summary = False
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        if tag == 'details' and 'faq__item' in dict(attrs).get('class', '').split():
            self.current = [[], []]
        if self.current is not None and tag == 'summary':
            self.summary = True

    def handle_data(self, data):
        if self.current is not None:
            self.current[0 if self.summary else 1].append(data)

    def handle_endtag(self, tag):
        if tag == 'summary':
            self.summary = False
        if tag == 'details' and self.current is not None:
            question, answer = [' '.join(' '.join(parts).split()) for parts in self.current]
            if question and answer:
                self.items.append({'@type': 'Question', 'name': question,
                                   'acceptedAnswer': {'@type': 'Answer', 'text': answer}})
            self.current = None


def structured_data(language, page_url, title, description, html, origin):
    uk = language == 'uk'
    name = 'Європейська гімназія' if uk else 'Европейская гимназия'
    city = 'Дніпро' if uk else 'Днепр'
    home = f'{origin}/{language}/'
    school_id = f'{origin}/#organization'
    website_id = f'{origin}/#website'
    image = f'{origin}/images/search-preview.jpg'
    programs = (
        ['Дитячий садок «Еврика»', 'Початкова школа (1–4 класи)', 'Середня та старша школа (5–11 класи)']
        if uk else
        ['Детский сад «Эврика»', 'Начальная школа (1–4 классы)', 'Средняя и старшая школа (5–11 классы)']
    )
    school = {
        '@type': ['School', 'EducationalOrganization'], '@id': school_id,
        'name': name, 'url': home,
        'description': ('Приватна школа повного дня у Дніпрі: 1–11 класи та дитячий садок «Еврика».' if uk else
                        'Частная школа полного дня в Днепре: 1–11 классы и детский сад «Эврика».'),
        'logo': {'@type': 'ImageObject', 'url': f'{origin}/images/school-logo.png'},
        'image': image, 'telephone': '+380671757773',
        'address': {'@type': 'PostalAddress',
                    'streetAddress': 'вул. Морська, 10' if uk else 'ул. Морская, 10',
                    'addressLocality': city, 'addressCountry': 'UA'},
        'areaServed': {'@type': 'City', 'name': city},
        'sameAs': ['https://www.youtube.com/@euroschoolDPua/',
                   'https://www.instagram.com/euroschool_dnipro/'],
        'hasOfferCatalog': {
            '@type': 'OfferCatalog',
            'name': 'Освітні програми' if uk else 'Образовательные программы',
            'itemListElement': [
                {'@type': 'Offer', 'itemOffered': {'@type': 'EducationalOccupationalProgram', 'name': program}}
                for program in programs
            ],
        },
    }
    # Weekdays, postal code and exact coordinates in the old script were not
    # corroborated by visible content. Do not silently present them as verified.
    graph = [school, {
        '@type': 'WebSite', '@id': website_id, 'url': origin + '/',
        'name': name, 'inLanguage': ['uk', 'ru'], 'publisher': {'@id': school_id},
    }, {
        '@type': 'WebPage', '@id': page_url + '#webpage', 'url': page_url,
        'name': title, 'description': description, 'inLanguage': language,
        'isPartOf': {'@id': website_id}, 'about': {'@id': school_id},
        'primaryImageOfPage': {'@type': 'ImageObject', 'url': image, 'width': 478, 'height': 478},
    }]
    faq = VisibleFAQ(html).items
    if faq:
        # Use the actual translated questions and answers, including the hours,
        # instead of maintaining a second, potentially contradictory FAQ.
        graph[2]['@type'] = ['WebPage', 'FAQPage']
        graph[2]['mainEntity'] = faq
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=2)
    # Keep future user-authored content from terminating the HTML script element.
    data = data.replace('&', '\\u0026').replace('<', '\\u003c').replace('>', '\\u003e')
    return '<script type="application/ld+json">\n' + data + '\n</script>\n'
