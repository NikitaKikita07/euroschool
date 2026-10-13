"""Check the generated migration before deployment (standard library only)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET
import json

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
    for name in ('index.html', 'teachers.html', 'creativity.html', 'evrika.html'):
        path = ROOT / ('' if language == 'uk' else language) / name
        page = Page(path)
        other = 'ru' if language == 'uk' else 'uk'
        suffix = '' if path.name == 'index.html' else path.name
        expected = ORIGIN + ('/' if language == 'uk' else '/ru/') + suffix
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
        assert webpage['@type'] == 'WebPage'
        assert 'mainEntity' not in webpage
        assert 'hasOfferCatalog' not in school
        assert one([a for t, a in page.tags if t == 'html'])['lang'] == language
        assert one([a for t, a in page.tags if a.get('rel') == 'canonical'])['href'] == expected
        for lang in ('uk', 'ru', 'x-default'):
            alternate = one([a for t, a in page.tags if a.get('rel') == 'alternate' and a.get('hreflang') == lang])
            assert alternate['href'] == ORIGIN + ('/ru/' if lang == 'ru' else '/') + suffix
        switch = one([a for t, a in page.tags if a.get('class') == 'lang-switch'])
        assert switch['href'] == ('/ru/' if other == 'ru' else '/') + suffix
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

# Migration fallbacks and static-host redirects must lead straight to canonical URLs.
redirects = {}
for line in (ROOT / '_redirects').read_text().splitlines():
    source, target, status = line.split()
    assert status == '301'
    assert source != target
    redirects[source] = target
assert '/' not in redirects
for name in ('index.html', 'teachers.html', 'creativity.html', 'evrika.html'):
    target = '/' + ('' if name == 'index.html' else name)
    assert redirects['/uk/' + name] == target
    fallback = Page(ROOT / 'uk' / name)
    assert one([a for t, a in fallback.tags if a.get('rel') == 'canonical'])['href'] == ORIGIN + target
assert redirects['/uk/'] == '/'
assert redirects['/index.html'] == '/'
for target in redirects.values():
    assert urlsplit(target).path not in redirects, f'Redirect chain: {target}'
for entry in sitemap.findall('s:url', ns):
    for alternate in entry.findall('{http://www.w3.org/1999/xhtml}link'):
        assert alternate.attrib['href'] in urls
print('PASS migration redirects and sitemap alternates')
