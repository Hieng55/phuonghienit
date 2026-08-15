from pathlib import Path
from bs4 import BeautifulSoup
import json, sys
root=Path(__file__).resolve().parents[1]
htmls=list(root.rglob('*.html'))
errors=[]
indexable=[]
for f in htmls:
    s=BeautifulSoup(f.read_text(encoding='utf-8'),'html.parser')
    rel=f.relative_to(root)
    title=(s.title.string or '').strip() if s.title else ''
    desc=s.find('meta',attrs={'name':'description'})
    canon=s.find('link',rel='canonical')
    robots=s.find('meta',attrs={'name':'robots'})
    noindex=robots and 'noindex' in robots.get('content','')
    if not title: errors.append(f'{rel}: missing title')
    if not desc or not desc.get('content','').strip(): errors.append(f'{rel}: missing description')
    if not canon: errors.append(f'{rel}: missing canonical')
    if not noindex:
        indexable.append(rel)
        if len(s.find_all('h1'))!=1: errors.append(f'{rel}: expected exactly one H1, got {len(s.find_all("h1"))}')
    for sc in s.find_all('script',attrs={'type':'application/ld+json'}):
        try: json.loads(sc.string or sc.get_text())
        except Exception as e: errors.append(f'{rel}: invalid JSON-LD {e}')
# internal links
for f in htmls:
    s=BeautifulSoup(f.read_text(encoding='utf-8'),'html.parser')
    for a in s.find_all('a',href=True):
        h=a['href']
        if not h.startswith('/') or h.startswith('//') or h.startswith('/#') or h in ['/'] or '#' in h: continue
        path=h.split('?',1)[0]
        target=(root/path.strip('/'))
        ok=(target.is_dir() and (target/'index.html').exists()) or target.exists()
        if not ok: errors.append(f'{f.relative_to(root)}: broken internal link {h}')
print(f'HTML pages: {len(htmls)}; indexable: {len(indexable)}')
if errors:
    print('ERRORS:')
    for e in errors: print('-',e)
    sys.exit(1)
print('PASS: titles, descriptions, canonicals, single H1 on indexable pages, JSON-LD, internal links')
