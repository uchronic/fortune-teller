"""Build a deterministic browser Python archive from the committed engine snapshot."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
dest = root / 'public' / 'python'
dest.mkdir(parents=True, exist_ok=True)
entries = {}
with zipfile.ZipFile(root / 'engine' / 'vendor.zip') as vendor:
    for name in vendor.namelist():
        entries[name] = vendor.read(name)
for folder in ['mlss', 'qimen']:
    for file in (root/'engine'/folder).rglob('*'):
        if file.is_file() and file.suffix in ('.py', '.json'):
            entries[folder + '/' + file.relative_to(root/'engine'/folder).as_posix()] = file.read_bytes()
for name in ['api.py', 'ephem_compat.py', 'manifest.json']:
    entries[name] = (root/'engine'/name).read_bytes()
with zipfile.ZipFile(dest/'mlss.zip', 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name in sorted(entries):
        info = zipfile.ZipInfo(name, (2026, 10, 19, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        archive.writestr(info, entries[name])
print(f'Packaged Python engine: {(dest/"mlss.zip").stat().st_size:,} bytes')
