"""Convert generated PNGs in brand/{covers,bg,quotes,v2/*} to 1080px-wide JPEGs and delete the PNGs."""
import glob, os
from PIL import Image

for png in glob.glob('brand/covers/*.png') + glob.glob('brand/bg/*.png') + glob.glob('brand/quotes/*.png') + glob.glob('brand/v2/*/*.png'):
    im = Image.open(png).convert('RGB')
    w, h = im.size
    if w != 1080:
        im = im.resize((1080, round(h * 1080 / w)), Image.LANCZOS)
    im.save(png[:-4] + '.jpg', quality=88, optimize=True, progressive=True)
    os.remove(png)
    print('ok', png[:-4] + '.jpg')
