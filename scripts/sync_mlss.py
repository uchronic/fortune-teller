"""Synchronize an explicit public allowlist; never copy profiles, cases, memories or credentials."""
import argparse
import ast
import hashlib
import importlib.metadata
import json
from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--skill', type=Path, required=True)
parser.add_argument('--qimen', type=Path, required=True)
args = parser.parse_args()
target = ROOT / 'engine' / 'mlss'
target.mkdir(parents=True, exist_ok=True)
modules = ['wuxing_quantify.py', 'chenggu.py', 'patterns_bridge.py', 'heming_bridge.py',
           'classics_bridge.py', 'nihai_bridge.py']
def public_source(source):
    text=source.read_text(encoding='utf-8')
    tree=ast.parse(text)
    lines=text.splitlines(keepends=True)
    ranges=[]
    for node in tree.body:
        if isinstance(node,ast.If) and '__name__' in ast.unparse(node.test):
            ranges.append((node.lineno-1,node.end_lineno))
        if isinstance(node,ast.Expr) and isinstance(node.value,ast.Constant) and isinstance(node.value.value,str) and ('用户' in node.value.value or '施主' in node.value.value):
            ranges.append((node.lineno-1,node.end_lineno))
    for start,end in sorted(ranges,reverse=True): del lines[start:end]
    return ''.join(lines)
manifest = []
for name in modules:
    source = args.skill / name
    (target/name).write_text(public_source(source),encoding='utf-8')
    manifest.append({'path': name, 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()})
(target/'meihua_shichen_qigua.py').write_text(public_source(args.skill/'scripts'/'meihua_shichen_qigua.py'),encoding='utf-8')
for name in ['lookup_tables.json', 'verse_profiles.json']:
    dest = target / 'references' / 'chenggu' / name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(args.skill / 'references' / 'chenggu' / name, dest)
qimen = ROOT / 'engine' / 'qimen'
qimen.mkdir(parents=True, exist_ok=True)
for name in ['kinqimen.py', 'config.py', 'angan.py', 'jieqi.py', 'sxtwl_bridge.py']:
    (qimen/name).write_text(public_source(args.qimen/name),encoding='utf-8')
vendor = ROOT / 'engine' / 'vendor.zip'
with zipfile.ZipFile(vendor, 'w', zipfile.ZIP_DEFLATED) as archive:
    for package, dist in [('lunar_python', 'lunar-python'), ('bidict', 'bidict')]:
        distribution = importlib.metadata.distribution(dist)
        location = Path(distribution.locate_file(package))
        for file in sorted(location.rglob('*.py')):
            archive.write(file, file.relative_to(location.parent).as_posix())
        for file in distribution.files or []:
            if 'license' in str(file).lower() or 'copying' in str(file).lower():
                full = Path(distribution.locate_file(file))
                if full.is_file():
                    archive.write(full, 'licenses/' + dist + '/' + full.name)
metadata = {'version': '1.5.0', 'syncedAt': '2026-10-19', 'modules': manifest,
            'lunarPython': importlib.metadata.version('lunar-python'),
            'bidict': importlib.metadata.version('bidict'),
            'privacy': 'Public code allowlist only. No profile, cases, memories, environment or personal data.'}
(ROOT/'engine'/'manifest.json').write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding='utf-8')
print('Synced public calculation modules and frozen dependencies.')
