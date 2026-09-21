"""Check the generated migration before deployment (standard library only)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
import json
from structured_data import VisibleFAQ

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://euroschool.dp.ua'

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.schemas = []
        self.schema_text = None
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag == 'script' and dict(attrs).get('type') == 'application/ld+json':
            self.schema_text = ''

    def handle_data(self, text):
        if self.schema_text is not None:
            self.schema_text += text

    def handle_endtag(self, tag):
        if tag == 'script' and self.schema_text is not None:
            self.schemas.append(json.loads(self.schema_text))
            self.schema_text = None

def one(items):
    assert len(items) == 1, f'Expected one element, got {len(items)}'
    return items[0]

urls = set()
for language in ('uk', 'ru'):
    for path in sorted((ROOT / language).glob('*.html')):
        page = Page(path)
        other = 'ru' if language == 'uk' else 'uk'
        suffix = '' if path.name == 'index.html' else path.name
        expected = f'{ORIGIN}/{language}/{suffix}'
        urls.add(expected)
        schema = one(page.schemas)
        assert schema['@context'] == 'https://schema.org'
        graph = schema['@graph']
        assert len({node['@id'] for node in graph}) == len(graph)
        school, website, webpage = graph
        assert 'School' in school['@type']
        assert school['telephone'] == '+380671757773'
        assert webpage['url'] == expected and webpage['@id'] == expected + '#webpage'
        assert webpage['inLanguage'] == language
        assert webpage['description'] == one([a for t, a in page.tags if a.get('name') == 'description'])['content']
        assert webpage['about']['@id'] == school['@id']
        assert webpage['isPartOf']['@id'] == website['@id']
        assert not any('seo.js' in a.get('src', '') for t, a in page.tags)
        faq = VisibleFAQ(path.read_text(encoding='utf-8')).items
        assert webpage.get('mainEntity', []) == faq
        assert ('FAQPage' in webpage['@type']) == bool(faq)
        assert one([a for t, a in page.tags if t == 'html'])['lang'] == language
        assert one([a for t, a in page.tags if a.get('rel') == 'canonical'])['href'] == expected
        for lang in ('uk', 'ru', 'x-default'):
            alternate = one([a for t, a in page.tags if a.get('rel') == 'alternate' and a.get('hreflang') == lang])
            assert alternate['href'] == f'{ORIGIN}/{"uk" if lang == "x-default" else lang}/{suffix}'
        switch = one([a for t, a in page.tags if a.get('class') == 'lang-switch'])
        assert switch['href'] == f'../{other}/{suffix}'
        for tag, attrs in page.tags:
            assert 'data-' + other not in attrs
            for key in ('href', 'src', 'poster', 'data-lightbox-src'):
                value = attrs.get(key, '')
                parsed = urlsplit(value)
                if parsed.scheme or parsed.netloc or not parsed.path:
                    continue
                target = ROOT / unquote(parsed.path).lstrip('/') if parsed.path.startswith('/') else path.parent / unquote(parsed.path)
                assert target.exists(), f'{path}: missing {key}={value}'
        template = Page(ROOT / 'templates' / (path.name + '.in'))
        video_titles = {a['data-video-id']: a['data-video-title-' + language] for t, a in template.tags if 'data-video-title-' + language in a}
        for tag, attrs in page.tags:
            if attrs.get('data-video-id') in video_titles:
                assert attrs['data-video-title'] == video_titles[attrs['data-video-id']]
        print(f'PASS {language}/{path.name}')

ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
sitemap = ET.parse(ROOT / 'sitemap.xml')
assert {e.text for e in sitemap.findall('s:url/s:loc', ns)} == urls
assert len(urls) == 8
print('PASS sitemap: all eight canonical URLs')
