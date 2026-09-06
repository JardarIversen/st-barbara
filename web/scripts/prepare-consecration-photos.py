"""Create web derivatives; never overwrite the downloaded camera originals."""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / '.local' / 'image-originals'
OUTPUT = ROOT / 'web' / 'public' / 'images'

# Fractional crops applied AFTER camera orientation and fine rotation.
# Negative Pillow angles are clockwise; the altar edge in IMG_9160 needs 3.2°.
PHOTOS = [
    ('9158', 'kirkevigsel-alter', (0.025, 0.04, 0.975, 0.99), 0),
    ('9125', 'kirkevigsel-menighet', (0.025, 0.025, 0.975, 0.975), 0),
    ('9160', 'kirkevigsel-salving-rettet', (0.045, 0.045, 0.955, 0.955), -3.2),
]

for number, name, crop, rotation in PHOTOS:
    with Image.open(SOURCE / f'IMG_{number}.jpg') as original:
        upright = ImageOps.exif_transpose(original).convert('RGB')
        if rotation:
            upright = upright.rotate(rotation, resample=Image.Resampling.BICUBIC)
        w, h = upright.size
        edited = upright.crop(tuple(round(v * dimension) for v, dimension in zip(crop, (w, h, w, h))))
        edited.thumbnail((2200, 2200), Image.Resampling.LANCZOS)
        edited.save(OUTPUT / f'{name}.webp', 'WEBP', quality=88, method=6)
        print(name, edited.size)
