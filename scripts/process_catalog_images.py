import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont

SRC_DIR = r"c:\Users\USUARIO\Downloads\WEB1\Catalogo_Imagenes"
OUT_DIR = r"c:\Users\USUARIO\Downloads\WEB1\public\images\catalogo"
os.makedirs(OUT_DIR, exist_ok=True)

CANVAS_W = 1200
CANVAS_H = 1600

# Catalog specification for all 18 products
# Note: Non-touching text/logos/circles have area < 42,000 and are automatically removed by connected-component filtering.
# erase_boxes is ONLY used where cursive text physically touches a garment edge by 1-2px.
ITEMS = [
    {
        "idx": 1,
        "file": "047bf325-1ae0-4a11-9caf-35918da5925e.jpg",
        "slug": "jean-01",
        "title": "JEAN WIDE LEG BOLSILLO",
        "subtitle": "Tiro Alto · Bolsillos de Parche",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [],
        "main_roi": (0, 45, 490, 1512),
        "sec_roi": (1040, 0, 1460, 1015),
        "swatch_roi": (460, 25, 1072, 1110),
        "swatch_top_n": 1,
    },
    {
        "idx": 2,
        "file": "06b90634-d85d-4748-b400-14ba45b7a375.jpg",
        "slug": "jean-02",
        "title": "JEAN CAMPANA LEVANTACOLA",
        "subtitle": "Realce Anatómico · +4 cm Tiro Alto",
        "tones": "Claro · Medio · Obscuro · Industrial",
        "sizes": "Tallas 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [(335, 570, 488, 625)],
        "main_roi": (0, 14, 470, 1265),
        "sec_roi": (838, 0, 1280, 938),
        "swatch_roi": (440, 215, 705, 938),
        "swatch_top_n": 2,
    },
    {
        "idx": 3,
        "file": "09144e04-f6d5-4e12-864a-a5b912108b72.jpg",
        "slug": "jean-03",
        "title": "JEAN WIDE LEG COLOR PLUS",
        "subtitle": "Línea Plus Stretch · Paleta Tierra & Borgoña",
        "tones": "Perla · Beige · Camel · Café · Borgoña",
        "sizes": "Tallas 18 · 20 · 22 · 24",
        "erase_boxes": [],
        "main_roi": (75, 105, 536, 1438),
        "sec_roi": (1105, 0, 1500, 748),
        "swatch_roi": (490, 25, 1045, 1048),
        "swatch_top_n": 1,
    },
    {
        "idx": 4,
        "file": "115da3c4-ea9c-466c-8d14-9085286e72d5.jpg",
        "slug": "jean-04",
        "title": "FALDA SHORT PLIZADA DENIM",
        "subtitle": "Tablas Sartoriales · Short Interno",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 6 · 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [],
        "main_roi": (15, 5, 425, 1276),
        "sec_roi": (455, 50, 990, 865),
        "swatch_roi": (455, 50, 990, 865),
        "sec_top_n": 2,
        "swatch_top_n": 2,
    },
    {
        "idx": 5,
        "file": "1b13042c-0d65-46f0-aaa4-79cd54f069c2.jpg",
        "slug": "jean-05",
        "title": "JEAN RECTO LEVANTACOLA PLUS",
        "subtitle": "Línea Plus · Pinzas de Realce Posterior",
        "tones": "Gris Carbón · Negro Intenso",
        "sizes": "Tallas 18 · 20 · 22 · 24",
        "erase_boxes": [(463, 855, 620, 960)],
        "main_roi": (70, 20, 512, 1492),
        "sec_roi": (1082, 0, 1478, 930),
        "swatch_roi": (1082, 0, 1478, 930),
        "swatch_top_n": 1,
    },
    {
        "idx": 6,
        "file": "4a2701fa-c733-4210-a3cb-ee8700714663.jpg",
        "slug": "jean-06",
        "title": "JEAN SKINNY PLUS LEVANTACOLA",
        "subtitle": "Línea Plus · Ajuste Escultural & Realce",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 18 · 20",
        "erase_boxes": [(325, 568, 498, 625)],
        "main_roi": (32, 10, 396, 970),
        "sec_roi": (555, 5, 945, 885),
        "swatch_roi": (555, 5, 945, 885),
        "swatch_top_n": 1,
        "inpaint_yellow_roi": (600, 620, 890, 710),
    },
    {
        "idx": 7,
        "file": "54f21204-d78c-407c-9845-c15b012c89ef.jpg",
        "slug": "jean-07",
        "title": "JEAN WIDE LEG CON CORREA",
        "subtitle": "Costura Vertical Estilizada · Cinturón Camel",
        "tones": "Claro · Obscuro",
        "sizes": "Tallas 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [],
        "main_roi": (45, 18, 526, 1262),
        "sec_roi": (790, 0, 1220, 855),
        "swatch_roi": (790, 0, 1220, 855),
        "swatch_top_n": 1,
    },
    {
        "idx": 8,
        "file": "556a0b52-8782-4232-a5e0-417eb9928866.jpg",
        "slug": "jean-08",
        "title": "JEAN WIDE LEG PLUS ATELIER",
        "subtitle": "Línea Plus · Caída Fluida de Pierna Ancha",
        "tones": "Claro · Medio · Oscuro",
        "sizes": "Tallas 18 · 20 · 22 · 24",
        "erase_boxes": [],
        "main_roi": (865, 22, 1280, 1106),
        "sec_roi": (38, 565, 595, 1252),
        "swatch_roi": (38, 565, 595, 1252),
        "swatch_top_n": 1,
    },
    {
        "idx": 9,
        "file": "61ae7019-e59d-49e6-9353-0984f2ba7a8c.jpg",
        "slug": "jean-09",
        "title": "JEAN WIDE LEG CORTE VERTICAL",
        "subtitle": "Nervio Central Sartorial · Tiro Alto",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [(670, 975, 843, 1040)],
        "main_roi": (800, 82, 1200, 1560),
        "sec_roi": (22, 55, 730, 1010),
        "swatch_roi": (22, 55, 730, 1010),
        "swatch_top_n": 1,
    },
    {
        "idx": 10,
        "file": "6516144f-2d46-4c16-a918-be9e48a295c7.jpg",
        "slug": "jean-10",
        "title": "JEAN RECTO LEVANTACOLA PLUS",
        "subtitle": "Línea Plus · Corte Recto & Realce Clásico",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 18 · 20 · 22 · 24",
        "erase_boxes": [],
        "main_roi": (22, 40, 595, 1450),
        "sec_roi": (575, 72, 1172, 942),
        "swatch_roi": (575, 72, 1172, 942),
        "swatch_top_n": 1,
    },
    {
        "idx": 11,
        "file": "88902691-34a0-4b64-8c08-7ec1e42ddacd.jpg",
        "slug": "jean-11",
        "title": "JEAN WIDE LEG PINZAS",
        "subtitle": "Pinzas Sartoriales · Edición 6 Tonos",
        "tones": "Claro · Medio · Obscuro · Industrial · Gris · Negro",
        "sizes": "Tallas 8 · 10 · 12 · 14",
        "erase_boxes": [],
        "main_roi": (575, 22, 1255, 972),
        "sec_roi": (60, 8, 515, 1265),
        "swatch_roi": (60, 8, 515, 1265),
        "swatch_top_n": 1,
    },
    {
        "idx": 12,
        "file": "c8038e96-f7b8-4a01-8150-189876f248d7.jpg",
        "slug": "jean-12",
        "title": "JEAN CAMPANA LEVANTACOLA NOIR",
        "subtitle": "Lavado Carbón & Negro · Realce Escultural",
        "tones": "Gris Carbón · Negro Intenso",
        "sizes": "Tallas 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [],
        "main_roi": (4, 0, 504, 918),
        "sec_roi": (590, 328, 924, 820),
        "swatch_roi": (590, 328, 924, 820),
        "swatch_top_n": 1,
    },
    {
        "idx": 13,
        "file": "cd3d9835-be6b-4583-9fba-7405720ac6ce.jpg",
        "slug": "jean-13",
        "title": "JEAN CAMPANA CLÁSICO ATELIER",
        "subtitle": "Largo Promedio · Silueta Flare Equilibrada",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [],
        "main_roi": (14, 5, 626, 1506),
        "sec_roi": (486, 58, 1082, 998),
        "swatch_roi": (1085, 102, 1438, 675),
        "swatch_top_n": 1,
    },
    {
        "idx": 14,
        "file": "d36a976f-2101-4532-8564-c467be6f7a00.jpg",
        "slug": "jean-14",
        "title": "JEAN WIDE LEG COLOR TIERRA",
        "subtitle": "Denim Teñido Artesanal · Paleta Cálida",
        "tones": "Café Espresso · Camel · Beige",
        "sizes": "Tallas 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [],
        "main_roi": (72, 34, 516, 1482),
        "sec_roi": (608, 238, 1334, 672),
        "swatch_roi": (608, 238, 1334, 672),
        "sec_top_n": 2,
        "swatch_top_n": 2,
    },
    {
        "idx": 15,
        "file": "db95e436-1c9d-499c-84c8-1f5d254afab0.jpg",
        "slug": "jean-15",
        "title": "JEAN BAGGY CORTE RÍGIDO",
        "subtitle": "Denim Rígido 100% Algodón · Costura Curva",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 6 · 8 · 10 · 12 · 14",
        "erase_boxes": [],
        "main_roi": (6, 12, 435, 1252),
        "sec_roi": (588, 60, 952, 818),
        "swatch_roi": (588, 60, 952, 818),
        "sec_top_n": 2,
        "swatch_top_n": 2,
    },
    {
        "idx": 16,
        "file": "e99a22e2-4c9f-48d7-9e70-215b621a13b7.jpg",
        "slug": "jean-16",
        "title": "JEAN WIDE LEG EXTRA LARGO NOIR",
        "subtitle": "+4 cm Largo Editorial · Lavado Mineral",
        "tones": "Gris Mineral · Negro · Claro",
        "sizes": "Tallas 6 · 8 · 10 · 12 · 14",
        "erase_boxes": [],
        "main_roi": (32, 12, 520, 1268),
        "sec_roi": (842, 0, 1268, 948),
        "swatch_roi": (420, 210, 806, 886),
        "swatch_top_n": 1,
    },
    {
        "idx": 17,
        "file": "ec95a53b-d3f6-4be5-bed2-45da2ae097b0.jpg",
        "slug": "jean-17",
        "title": "JEAN WIDE LEG ESENCIAL",
        "subtitle": "Tiro Alto Clásico · Pierna Ancha Fluida",
        "tones": "Claro · Medio · Obscuro",
        "sizes": "Tallas 6 · 8 · 10 · 12 · 14 · 16",
        "erase_boxes": [(554, 620, 658, 675)],
        "main_roi": (572, 102, 960, 1280),
        "sec_roi": (62, 240, 552, 852),
        "swatch_roi": (62, 240, 552, 852),
        "swatch_top_n": 1,
    },
    {
        "idx": 18,
        "file": "ef1affd1-c7b6-4b85-92b3-ee046dfe1b15.jpg",
        "slug": "jean-18",
        "title": "JEAN RECTO ROTO STRETCH",
        "subtitle": "Denim Stretch Confort · Desgaste Artesanal",
        "tones": "Claro · Obscuro",
        "sizes": "Tallas 6 · 8 · 10 · 12 · 14",
        "erase_boxes": [],
        "main_roi": (50, 6, 482, 1258),
        "sec_roi": (745, 0, 1160, 845),
        "swatch_roi": (745, 0, 1160, 845),
        "swatch_top_n": 1,
    },
]


def load_fonts():
    fonts_dir = r"C:\Windows\Fonts"
    serif_reg = os.path.join(fonts_dir, "georgia.ttf")
    serif_bold = os.path.join(fonts_dir, "georgiab.ttf")
    sans_semi = os.path.join(fonts_dir, "seguisb.ttf")
    return {
        "brand_top": ImageFont.truetype(serif_reg, 17),
        "card_brand": ImageFont.truetype(serif_reg, 19),
        "card_title": ImageFont.truetype(serif_bold, 34),
        "card_sub": ImageFont.truetype(serif_reg, 21),
        "card_meta": ImageFont.truetype(sans_semi, 18),
    }


FONTS = load_fonts()


def clean_base_image(img_bgr, item):
    cleaned = img_bgr.copy()
    if "inpaint_yellow_roi" in item:
        x1, y1, x2, y2 = item["inpaint_yellow_roi"]
        roi = cleaned[y1:y2, x1:x2]
        b, g, r = cv2.split(roi)
        yellow_mask = ((r.astype(int) - b.astype(int) > 25) & (g.astype(int) - b.astype(int) > 15)).astype(np.uint8) * 255
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        yellow_mask = cv2.dilate(yellow_mask, kernel, iterations=1)
        inpainted = cv2.inpaint(roi, yellow_mask, 6, cv2.INPAINT_TELEA)
        cleaned[y1:y2, x1:x2] = inpainted

    for (x1, y1, x2, y2) in item.get("erase_boxes", []):
        cleaned[max(0, y1):min(cleaned.shape[0], y2), max(0, x1):min(cleaned.shape[1], x2)] = 255

    return cleaned


def extract_clean_roi(cleaned_bgr, roi, keep_top_n=1, min_area=35000):
    x1, y1, x2, y2 = roi
    h, w, _ = cleaned_bgr.shape
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(w, x2), min(h, y2)
    crop = cleaned_bgr[y1:y2, x1:x2].copy()

    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    mask = (gray < 246).astype(np.uint8) * 255
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    closed = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(closed)

    comps = []
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        if area >= min_area:
            comps.append((area, i))
    comps.sort(reverse=True)
    keep_ids = set(cid for _, cid in comps[:keep_top_n])

    keep_mask = np.isin(labels, list(keep_ids)).astype(np.uint8) * 255
    keep_mask = cv2.dilate(keep_mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)), iterations=1)

    # Fill torso horizontally in upper 48% so white tops stay intact;
    # in lower 52% only close small internal holes so gap between legs stays background
    filled_mask = cv2.morphologyEx(keep_mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    torso_limit = int(filled_mask.shape[0] * 0.48)
    for r in range(torso_limit):
        cols = np.where(keep_mask[r] > 0)[0]
        if len(cols) > 1:
            filled_mask[r, cols[0]:cols[-1] + 1] = 255

    out = np.full_like(crop, 255)
    out[filled_mask > 0] = crop[filled_mask > 0]

    gray_out = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY)
    ys, xs = np.where(gray_out < 246)
    if len(xs) > 0 and len(ys) > 0:
        tx1, ty1, tx2, ty2 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
        out = out[ty1:ty2, tx1:tx2]
        filled_mask = filled_mask[ty1:ty2, tx1:tx2]

    return out, filled_mask


def enhance_subject_pil(bgr_img):
    rgb = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    pil_im = Image.fromarray(rgb)
    pil_im = ImageEnhance.Contrast(pil_im).enhance(1.05)
    pil_im = ImageEnhance.Color(pil_im).enhance(1.06)
    pil_im = ImageEnhance.Sharpness(pil_im).enhance(1.18)
    return pil_im


def create_studio_canvas(w=CANVAS_W, h=CANVAS_H, with_floor_shadow=True):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = (xx - w * 0.5) / (w * 0.5)
    ny = (yy - h * 0.48) / (h * 0.52)
    dist = np.sqrt(nx ** 2 + ny ** 2)
    vig = np.clip((dist - 0.58) / 0.85, 0.0, 1.0) ** 1.6

    r = 255.0 - vig * (255.0 - 244.0)
    g = 255.0 - vig * (255.0 - 240.0)
    b = 255.0 - vig * (255.0 - 233.0)

    if with_floor_shadow:
        sx = (xx - w * 0.5) / (w * 0.24)
        sy = (yy - h * 0.915) / (h * 0.022)
        s_dist = sx ** 2 + sy ** 2
        shadow = np.exp(-s_dist * 1.4) * 11.0
        r -= shadow
        g -= shadow * 1.05
        b -= shadow * 1.12

    arr = np.stack([np.clip(r, 0, 255), np.clip(g, 0, 255), np.clip(b, 0, 255)], axis=-1).astype(np.uint8)
    return Image.fromarray(arr)


def draw_editorial_frame(canvas_pil, subtitle_tag="DENIM ATELIER COLLECTION"):
    draw = ImageDraw.Draw(canvas_pil)
    w, h = canvas_pil.size
    border_color = (218, 208, 192)
    draw.rectangle([28, 28, w - 29, h - 29], outline=border_color, width=1)

    header_text = f"A U R E L I A   A T E L I E R   ·   {subtitle_tag}"
    bbox = draw.textbbox((0, 0), header_text, font=FONTS["brand_top"])
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, 46), header_text, fill=(140, 128, 112), font=FONTS["brand_top"])


def paste_subject_on_studio(canvas_pil, subj_bgr, target_box):
    subj_pil = enhance_subject_pil(subj_bgr)
    sw, sh = subj_pil.size
    bx1, by1, bx2, by2 = target_box
    bw, bh = bx2 - bx1, by2 - by1

    scale = min(bw / sw, bh / sh)
    nw, nh = max(1, int(sw * scale)), max(1, int(sh * scale))
    subj_resized = subj_pil.resize((nw, nh), Image.Resampling.LANCZOS)

    px = bx1 + (bw - nw) // 2
    py = by1 + (bh - nh) // 2

    subj_arr = np.array(subj_resized).astype(np.float32)
    bg_arr = np.array(canvas_pil.crop((px, py, px + nw, py + nh))).astype(np.float32)

    gray = subj_arr.mean(axis=-1)
    is_fg = (gray < 247.0).astype(np.uint8) * 255
    filled_fg = cv2.morphologyEx(is_fg, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    torso_limit = int(filled_fg.shape[0] * 0.48)
    for r in range(torso_limit):
        cols = np.where(is_fg[r] > 0)[0]
        if len(cols) > 1:
            filled_fg[r, cols[0]:cols[-1] + 1] = 255
    alpha = cv2.GaussianBlur(filled_fg.astype(np.float32) / 255.0, (7, 7), 0)[..., None]

    blended = (subj_arr * alpha + bg_arr * (1.0 - alpha)).astype(np.uint8)
    canvas_pil.paste(Image.fromarray(blended), (px, py))


def build_product_images(item):
    src_path = os.path.join(SRC_DIR, item["file"])
    img_bgr = cv2.imread(src_path)
    if img_bgr is None:
        raise RuntimeError(f"Could not read {src_path}")

    cleaned = clean_base_image(img_bgr, item)

    main_bgr, _ = extract_clean_roi(cleaned, item["main_roi"], keep_top_n=1, min_area=40000)
    sec_bgr, _ = extract_clean_roi(cleaned, item["sec_roi"], keep_top_n=item.get("sec_top_n", 1), min_area=45000)
    swatch_bgr, _ = extract_clean_roi(cleaned, item["swatch_roi"], keep_top_n=item.get("swatch_top_n", 1), min_area=45000)

    # 1. EDITORIAL IMAGE (jean-XX-editorial.jpg)
    c_main = create_studio_canvas(CANVAS_W, CANVAS_H, with_floor_shadow=True)
    paste_subject_on_studio(c_main, main_bgr, (95, 95, CANVAS_W - 95, CANVAS_H - 75))
    draw_editorial_frame(c_main, "DENIM ATELIER COLLECTION")
    out_main = os.path.join(OUT_DIR, f"{item['slug']}-editorial.jpg")
    c_main.save(out_main, "JPEG", quality=94, optimize=True)

    # 2. DETALLE / SECONDARY VIEW (jean-XX-detalle.jpg)
    c_det = create_studio_canvas(CANVAS_W, CANVAS_H, with_floor_shadow=True)
    paste_subject_on_studio(c_det, sec_bgr, (110, 120, CANVAS_W - 110, CANVAS_H - 110))
    draw_editorial_frame(c_det, "FIT & WASH DETAIL")
    out_det = os.path.join(OUT_DIR, f"{item['slug']}-detalle.jpg")
    c_det.save(out_det, "JPEG", quality=94, optimize=True)

    # 3. TONOS & LOOKBOOK SPEC SHEET (jean-XX-tonos.jpg)
    c_ton = create_studio_canvas(CANVAS_W, CANVAS_H, with_floor_shadow=False)
    paste_subject_on_studio(c_ton, main_bgr, (55, 100, 610, 1300))
    paste_subject_on_studio(c_ton, swatch_bgr, (625, 120, 1145, 1280))
    draw_editorial_frame(c_ton, "LOOKBOOK & VARIANTES")

    draw = ImageDraw.Draw(c_ton)
    panel_y1, panel_y2 = 1330, 1545
    draw.rectangle([56, panel_y1, CANVAS_W - 56, panel_y2], fill=(20, 19, 18), outline=(196, 169, 104), width=1)

    draw.line([88, panel_y1 + 26, 220, panel_y1 + 26], fill=(196, 169, 104), width=2)
    draw.text((88, panel_y1 + 38), item["title"], fill=(248, 245, 238), font=FONTS["card_title"])
    draw.text((88, panel_y1 + 84), item["subtitle"], fill=(196, 169, 104), font=FONTS["card_sub"])

    tones_label = f"TONOS DISPONIBLES:  {item['tones'].upper()}"
    sizes_label = f"{item['sizes'].upper()}"
    draw.text((88, panel_y1 + 128), tones_label, fill=(220, 215, 205), font=FONTS["card_meta"])
    draw.text((88, panel_y1 + 158), sizes_label, fill=(180, 174, 164), font=FONTS["card_meta"])

    out_ton = os.path.join(OUT_DIR, f"{item['slug']}-tonos.jpg")
    c_ton.save(out_ton, "JPEG", quality=94, optimize=True)
    print(f"Processed {item['slug']}: {item['title']}")


if __name__ == "__main__":
    for item in ITEMS:
        build_product_images(item)
    print("All 18 products processed successfully!")
