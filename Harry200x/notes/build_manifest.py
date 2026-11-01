# Regenerates Harry200x/chapters.json from the chNN.md files. Run from the repo root with python3 -I.
import json, re, glob, os
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
items = []
for path in sorted(glob.glob(os.path.join(root, 'ch[0-9][0-9].md'))):
    text = open(path, encoding='utf-8').read()
    title = re.search(r'^#\s+(.+)$', text, re.M).group(1).strip()
    m = re.search(r'^\*(.+?)\*\s*$', text, re.M)
    dates = m.group(1).strip() if m else ''
    words = len(text.split())
    items.append({'file': os.path.basename(path), 'title': title, 'dates': dates, 'words': words})
json.dump({'chapters': items}, open(os.path.join(root, 'chapters.json'), 'w', encoding='utf-8'), indent=1)
print(len(items), 'chapters')
