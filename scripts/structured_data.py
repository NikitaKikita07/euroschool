"""Static Schema.org data built from page metadata."""
import json


def structured_data(language, page_url, title, description, html, origin):
    uk = language == 'uk'
    name = 'Європейська гімназія' if uk else 'Европейская гимназия'
    city = 'Дніпро' if uk else 'Днепр'
    home = origin + ('/' if language == 'uk' else '/ru/')
    school_id = f'{origin}/#organization'
    website_id = f'{origin}/#website'
    image = f'{origin}/images/search-preview.jpg'
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
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, indent=2)
    # Keep future user-authored content from terminating the HTML script element.
    data = data.replace('&', '\\u0026').replace('<', '\\u003c').replace('>', '\\u003e')
    return '<script type="application/ld+json">\n' + data + '\n</script>\n'
