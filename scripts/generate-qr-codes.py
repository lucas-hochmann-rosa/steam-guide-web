import os
import sys
import qrcode
from PIL import Image, ImageDraw

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://steam-guide-web.vercel.app"
OUT_DIR = os.path.join("public", "assets", "qrcodes")
os.makedirs(OUT_DIR, exist_ok=True)

ROOMS = [
    {"id": "f-08", "room": "Sala F-08", "title": "Galeria de arte", "block": "Bloco F - 1º andar"},
    {"id": "f-13", "room": "Sala F-13", "title": "Globalização em Arte: Arte, Geografia e Inglês", "block": "Bloco F - 1º andar"},
    {"id": "f-01-f-02", "room": "Salas F-01, F-02 e F-03", "title": "Jogos, desafios, charadas e enigmas matemáticos", "block": "Bloco F - Térreo"},
    {"id": "f-05", "room": "Sala F-05", "title": "Engenheiro por um dia", "block": "Bloco F - Térreo"},
    {"id": "a-19", "room": "Sala A-19", "title": "O Caminho dos Direitos", "block": "Bloco A - Entrada Principal"},
    {"id": "f-20", "room": "Sala F-20", "title": "Atividades De física", "block": "Bloco F - 2º andar"},
    {"id": "b-03-b-04", "room": "Laboratórios B-03 e B-04", "title": "Experimentos no laboratório", "block": "Bloco B"},
    {"id": "corredor-f", "room": "Corredor do Bloco F", "title": "Oficina de fotografia e audiovisual", "block": "Bloco F"},
    {"id": "f-09", "room": "Sala F-09", "title": "West Sharks FTC: robô da temporada BIOBUZZ", "block": "Bloco F - 1º andar"},
    {"id": "quadra", "room": "Quadra Poliesportiva", "title": "Prática de movimento e integração", "block": "Área Esportiva"}
]

def generate_qr(room):
    url = f"{BASE_URL}/?local={room['id']}"
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=14,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#102A43", back_color="white").convert("RGBA")
    qr_w, qr_h = qr_img.size

    logo_path = os.path.join("public", "icon-sesi-512.png")
    if os.path.exists(logo_path):
        logo_src = Image.open(logo_path).convert("RGBA")
        bbox = logo_src.getbbox()
        if bbox:
            logo_src = logo_src.crop(bbox)
        max_logo_size = int(qr_w * 0.22)
        lw, lh = logo_src.size
        ratio = min(max_logo_size / lw, max_logo_size / lh)
        new_lw = int(lw * ratio)
        new_lh = int(lh * ratio)
        logo_resized = logo_src.resize((new_lw, new_lh), Image.Resampling.LANCZOS)

        pad = int(qr_w * 0.035)
        badge_size = max(new_lw, new_lh) + pad * 2
        badge = Image.new("RGBA", (badge_size, badge_size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(badge)
        draw.rounded_rectangle(
            [0, 0, badge_size, badge_size],
            radius=int(badge_size * 0.25),
            fill="white",
            outline="#0754A6",
            width=4
        )
        lx = (badge_size - new_lw) // 2
        ly = (badge_size - new_lh) // 2
        badge.paste(logo_resized, (lx, ly), logo_resized)
        pos_x = (qr_w - badge_size) // 2
        pos_y = (qr_h - badge_size) // 2
        qr_img.paste(badge, (pos_x, pos_y), badge)

    out_file = os.path.join(OUT_DIR, f"qr-{room['id']}.png")
    qr_img.save(out_file, "PNG", optimize=True)
    return out_file

if __name__ == "__main__":
    for r in ROOMS:
        saved = generate_qr(r)
        print(f"Gerado: {saved} -> {BASE_URL}/?local={r['id']}")
    print(f"\nTodos os 10 QR Codes gerados com sucesso na pasta {OUT_DIR}!")
