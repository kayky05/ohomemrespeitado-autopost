"""Convert generated PNGs in brand/{covers,bg,quotes,v2/*} to 1080px-wide JPEGs and delete the PNGs."""
import glob, os, sys, time
from PIL import Image

# Uso: python scripts/optimize-images.py [id-do-post ...]
# Pula PNGs alterados nos últimos 60s (o gerador pode ainda estar gravando).
ids = sys.argv[1:]
pngs = [f for i in ids for f in glob.glob(f'brand/v2/{i}/*.png')] if ids else (
    glob.glob('brand/covers/*.png') + glob.glob('brand/bg/*.png') + glob.glob('brand/quotes/*.png') + glob.glob('brand/v2/*/*.png'))
for png in pngs:
    if time.time() - os.path.getmtime(png) < 60:
        print('pulado (recente)', png); continue
    im = Image.open(png).convert('RGB')
    w, h = im.size
    if w != 1080:
        im = im.resize((1080, round(h * 1080 / w)), Image.LANCZOS)
    im.save(png[:-4] + '.jpg', quality=88, optimize=True, progressive=True)
    os.remove(png)
    print('ok', png[:-4] + '.jpg')
