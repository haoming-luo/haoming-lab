"""Publish only reproducible teaching sources and meshes, never runtime outputs."""
from pathlib import Path
import shutil,zipfile,hashlib,json,sys
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'examples/teaching'
SRC=Path(sys.argv[1]) if len(sys.argv)>1 else DEST
WEB=ROOT/'public/learn/files'
WEB.mkdir(parents=True,exist_ok=True)
for name in ['column','honeycomb']:
    out=DEST/name;out.mkdir(parents=True,exist_ok=True)
    names=['case.py','agentfem.toml']+(['generate_mesh.py','honeycomb.msh','honeycomb-fine.msh'] if name=='honeycomb' else ['load_path.py'])
    if SRC.resolve()!=DEST.resolve():
        for file in names:shutil.copy2(SRC/name/file,out/file)
        shutil.copy2(SRC/'README.md',out/'README.md')
        shutil.copy2(SRC/'reference.json',out/'reference.json')
    manifest={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(out.iterdir()) if p.is_file() and p.name!='checksums.json'}
    (out/'checksums.json').write_text(json.dumps(manifest,indent=2)+'\n')
    with zipfile.ZipFile(WEB/f'{name}.zip','w',zipfile.ZIP_DEFLATED) as z:
        for p in sorted(out.iterdir()):z.write(p,arcname=f'{name}/{p.name}')
    print(name, (WEB/f'{name}.zip').stat().st_size)
