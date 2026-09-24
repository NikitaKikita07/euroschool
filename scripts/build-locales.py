"""Build deployable /uk/ and /ru/ pages: python scripts/build-locales.py."""
import json
import re
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from structured_data import structured_data

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'https://euroschool.dp.ua'
PAIRS = json.loads((ROOT / 'scripts/translations.json').read_text(encoding='utf-8'))
KEYWORDS = {
    'ru': 'частная школа днепр, частная школа в днепре, частные школы днепра, частные школы в днепре, частная школа выбор, частная школа цены, лучшие частные школы днепра, рейтинг школ днепра, европейская гимназия днепр, украина',
    'uk': 'приватна школа дніпро, приватна школа у дніпрі, приватні школи дніпро, приватні школи у дніпрі, приватна школа вибір, приватна школа ціни, кращі приватні школи дніпро, рейтинг шкіл дніпро, європейська гімназія дніпро, україна',
}
META = {
    'index.html': {
        'uk': ('Приватна школа у Дніпрі | Європейська гімназія', 'Європейська гімназія — приватна школа у Дніпрі, Україна. 1–11 класи, дитячий садок, повний день та творчі студії. Дізнайтеся про навчання, умови вступу та вартість.'),
        'ru': ('Частная школа в Днепре | Европейская гимназия', 'Европейская гимназия — частная школа в Днепре, Украина. 1–11 классы, детский сад, полный день и творческие студии. Узнайте об обучении, условиях поступления и стоимости.'),
    },
    'teachers.html': {
        'uk': ('Наші вчителі та результати учнів | Європейська гімназія Дніпро', 'Вчителі приватної школи «Європейська гімназія» у Дніпрі: індивідуальний підхід, творчі проєкти, результати НМТ і ЗНО та місця у рейтингах шкіл Дніпра.'),
        'ru': ('Наши учителя и результаты учеников | Европейская гимназия Днепр', 'Учителя частной школы «Европейская гимназия» в Днепре: индивидуальный подход, творческие проекты, результаты НМТ и ЗНО и места в рейтингах школ Днепра.'),
    },
    'creativity.html': {
        'uk': ('Творчість і шкільні проєкти | Європейська гімназія Дніпро', 'Театр, відео вистав, творчі роботи та проєкти учнів приватної школи «Європейська гімназія» у Дніпрі. Розвиток здібностей і шкільне життя.'),
        'ru': ('Творчество и школьные проекты | Европейская гимназия Днепр', 'Театр, видео спектаклей, творческие работы и проекты учеников частной школы «Европейская гимназия» в Днепре. Развитие способностей и школьная жизнь.'),
    },
    'evrika.html': {
        'uk': ('Приватний дитячий садок Еврика у Дніпрі | Європейська гімназія', 'Приватний дитячий садок «Еврика» при Європейській гімназії у Дніпрі: ігри, розвиток, творчість, турбота та підготовка до школи. Дізнайтеся про умови вступу.'),
        'ru': ('Частный детский сад Эврика в Днепре | Европейская гимназия', 'Частный детский сад «Эврика» при Европейской гимназии в Днепре: игры, развитие, творчество, забота и подготовка к школе. Узнайте об условиях поступления.'),
    },
}

def url(lang, page):
    return f'/{lang}/' + ('' if page == 'index.html' else page)

class Localize(HTMLParser):
    void = set('area base br col embed hr img input link meta param source track wbr'.split())

    def __init__(self, lang, page):
        super().__init__(convert_charrefs=False)
        self.lang, self.page, self.out, self.stack = lang, page, [], []
        self.dictionary = dict(PAIRS if lang == 'uk' else [(b, a) for a, b in PAIRS])
        self.pattern = re.compile('|'.join(re.escape(s) for s in sorted(self.dictionary, key=len, reverse=True)))

    def translate(self, text):
        return self.dictionary.get(text, self.pattern.sub(lambda m: self.dictionary[m[0]], text))

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        skip = (self.stack and self.stack[-1][1]) or f'data-{"ru" if self.lang == "uk" else "uk"}' in a
        skip = skip or (tag == 'script' and any(x in a.get('src', '') for x in ('seo.js', 'i18n.js')))
        literal = bool(f'data-{self.lang}' in a or (self.stack and self.stack[-1][2]))
        switch = 'lang-switch' in a.get('class', '').split()
        if tag not in self.void:
            self.stack.append((tag, bool(skip), literal, switch))
        if skip:
            return
        if tag == 'html': a['lang'] = self.lang
        if tag == 'body': a['data-lang'] = self.lang
        for key in ('placeholder', 'aria-label', 'title', 'alt'):
            if f'data-{key}-{self.lang}' in a:
                a[key] = a[f'data-{key}-{self.lang}']
            elif key in a:
                a[key] = self.translate(a[key])
        # Preserve the selected language for dynamic controls such as video titles.
        for key, value in list(a.items()):
            if key.startswith('data-') and key.endswith('-' + self.lang):
                base = key[:-3]
                if base not in ('data-placeholder', 'data-aria-label', 'data-title', 'data-alt'):
                    a[base] = value
        for key in list(a):
            if key.endswith(('-ru', '-uk')) and key.startswith('data-'):
                del a[key]
        for key in ('src', 'href', 'poster', 'data-lightbox-src'):
            if a.get(key, '').startswith(('images/', 'css/', 'js/', 'school-life.')):
                a[key] = '../' + a[key]
            elif key == 'href' and a.get(key, '').startswith('index.html'):
                a[key] = './' + a[key][len('index.html'):]
        if 'style' in a:
            a['style'] = a['style'].replace('images/', '../images/')
        if tag == 'script' and a.get('src', '').startswith('../js/'):
            a['src'] = a['src'].split('?')[0] + '?v=20260921-1'
        if switch:
            tag = 'a'
            a.pop('type', None)
            other = 'ru' if self.lang == 'uk' else 'uk'
            a.update(href='..' + url(other, self.page), hreflang=other, lang=other)
            a['aria-label'] = 'Перейти на русскую версию' if other == 'ru' else 'Перейти на українську версію'
        if tag == 'meta':
            key = a.get('name', a.get('property', a.get('itemprop')))
            title, desc = META[self.page][self.lang]
            if key in ('description', 'og:description', 'twitter:description'): a['content'] = desc
            if key in ('og:title', 'twitter:title'): a['content'] = title
            if key in ('author', 'og:site_name'): a['content'] = 'Європейська гімназія' if self.lang == 'uk' else 'Европейская гимназия'
            if key == 'og:locale': a['content'] = self.lang + '_UA'
            if key == 'og:locale:alternate': a['content'] = ('ru' if self.lang == 'uk' else 'uk') + '_UA'
            if key in ('og:image', 'twitter:image', 'image'): a['content'] = ORIGIN + '/images/search-preview.jpg'
            if key == 'og:image:alt': a['content'] = 'Європейська гімназія у Дніпрі' if self.lang == 'uk' else 'Европейская гимназия в Днепре'
        self.out.append('<' + tag + ''.join(' ' + k + ('' if v is None else '="' + escape(v, quote=True) + '"') for k, v in a.items()) + '>')

    def handle_endtag(self, tag):
        if tag in self.void: return
        entry = self.stack.pop()
        if entry[1]: return
        if tag == 'head':
            self.out.append('\n<meta name="keywords" content="' + KEYWORDS[self.lang] + '">\n')
            self.out.append(f'<link rel="canonical" href="{ORIGIN}{url(self.lang, self.page)}">\n')
            for lang in ('uk', 'ru', 'x-default'):
                self.out.append(f'<link rel="alternate" hreflang="{lang}" href="{ORIGIN}{url("uk" if lang == "x-default" else lang, self.page)}">\n')
            self.out.append(f'<meta property="og:url" content="{ORIGIN}{url(self.lang, self.page)}">\n<script src="../js/i18n.js?v=20260921-1"></script>\n')
        self.out.append('</' + ('a' if entry[3] else tag) + '>')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.void: self.handle_endtag(tag)

    def handle_data(self, data):
        if self.stack and self.stack[-1][1]: return
        if self.stack and self.stack[-1][0] == 'title': data = META[self.page][self.lang][0]
        elif self.stack and self.stack[-1][3]: data = 'RU' if self.lang == 'uk' else 'UA'
        elif not any(e[0] in ('script', 'style') or e[2] for e in self.stack): data = self.translate(data)
        self.out.append(data)

    def handle_entityref(self, name): self.handle_data('&' + name + ';')
    def handle_charref(self, name): self.handle_data('&#' + name + ';')
    def handle_decl(self, decl): self.out.append('<!' + decl + '>')
    def handle_comment(self, data):
        if not self.stack or not self.stack[-1][1]: self.out.append('<!--' + data + '-->')

def redirect(target):
    path, separator, fragment = target.partition('#')
    destination = (json.dumps(path) + ' + location.search + ' + json.dumps('#' + fragment)
                   if separator else json.dumps(target) + ' + location.search + location.hash')
    return f'''<!doctype html>
<html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Європейська гімназія</title><link rel="canonical" href="{ORIGIN}{target}">
<meta http-equiv="refresh" content="0; url={target}">
<script>location.replace({destination});</script>
</head><body><a href="{target}">Перейти на українську версію сайту</a></body></html>
'''

for page in META:
    for lang in ('uk', 'ru'):
        parser = Localize(lang, page)
        parser.feed((ROOT / 'templates' / (page + '.in')).read_text(encoding='utf-8'))
        (ROOT / lang).mkdir(exist_ok=True)
        html = ''.join(parser.out)
        title, description = META[page][lang]
        markup = structured_data(lang, ORIGIN + url(lang, page), title, description, html, ORIGIN)
        html = html.replace('</head>', markup + '</head>', 1)
        (ROOT / lang / page).write_text(html, encoding='utf-8')
    (ROOT / page).write_text(redirect(url('uk', page)), encoding='utf-8')
for alias, target in {
    'eureka': '/uk/evrika.html',
    'teachers': '/uk/teachers.html',
    'creativ': '/uk/creativity.html',
    'galery': '/uk/#children-gallery',
    'gallery': '/uk/#children-gallery',
}.items():
    directory = ROOT / alias
    directory.mkdir(exist_ok=True)
    (directory / 'index.html').write_text(redirect(target), encoding='utf-8')
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for page in META:
    for lang in ('uk', 'ru'):
        xml.append(f'  <url><loc>{ORIGIN}{url(lang, page)}</loc>')
        for other in ('uk', 'ru', 'x-default'):
            xml.append(f'    <xhtml:link rel="alternate" hreflang="{other}" href="{ORIGIN}{url("uk" if other == "x-default" else other, page)}"/>')
        xml.append('  </url>')
xml.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(xml) + '\n', encoding='utf-8')

# Use the same dictionary for messages created by JavaScript after page load.
runtime = ROOT / 'js/i18n.js'
source = runtime.read_text(encoding='utf-8')
start = source.index('const translations')
end = source.index('const reverseTranslations')
source = source[:start] + 'const translations = new Map(' + json.dumps(PAIRS, ensure_ascii=False, indent=2) + ');\n\n' + source[end:]
runtime.write_text(source, encoding='utf-8')
