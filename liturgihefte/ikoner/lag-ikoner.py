#!/usr/bin/env python3
"""Lager ikonene for kroppsstilling: stående, sittende og knelende.

Alle tre bygges av de samme målene, så hode, kropp, armer og bein er like store og like tykke
i alle ikonene. Figurene står i profil og vender mot høyre (mot alteret). Gulvet ligger på
samme linje i alle tre, slik at de står riktig i forhold til hverandre ved siden av hverandre.

    python3 lag-ikoner.py      # skriver staende.svg, sittende.svg og knelende.svg her
"""
import math
import pathlib

HERE = pathlib.Path(__file__).resolve().parent

# Rutenett og mål, i enheter av et 48 × 48-felt
SIZE = 48
FLOOR = 47.0          # underkanten av føttene og knærne
HEAD_R = 4.3          # hodets radius
NECK = 1.4            # luft mellom hode og kropp
TORSO_W = 10.4        # kroppens dybde i profil (litt bredere enn hodet)
TORSO_L = 6.2         # avstanden mellom kroppens endepunkter; de runde endene kommer i tillegg
HIP_DROP = 2.4        # hoftepunktet ligger litt under kroppens nedre endepunkt
LEG_W = 6.0           # beinas tykkelse
THIGH = 8.8           # lårets lengde
SHIN = 8.6            # leggens lengde
FOOT = 3.6            # fotens lengde forover
ARM_W = 4.4           # armenes tykkelse
ARM_FWD = 0.8         # skulderen ligger litt foran kroppens midtlinje
CHAIR_W = 3.0         # stolens strektykkelse, tynnere enn figuren

INK = "#000"
PAPER = "#fff"


def add(a, b):
    return (a[0] + b[0], a[1] + b[1])


def polar(length, degrees):
    """Vektor med gitt lengde. 0° er rett opp, 90° rett frem (mot høyre), 180° rett ned."""
    r = math.radians(degrees)
    return (length * math.sin(r), -length * math.cos(r))


def line(points, width, color=INK, extra=""):
    d = "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in points)
    return (f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width:.2f}" '
            f'stroke-linecap="round" stroke-linejoin="round"{extra}/>')


def upper_body(hip, lean=0.0):
    """Kropp og hode, målt fra hoftepunktet. Returnerer tegningen og skulderpunktet."""
    bottom = add(hip, polar(HIP_DROP, lean))
    top = add(bottom, polar(TORSO_L, lean))
    head = add(top, polar(TORSO_W / 2 + NECK + HEAD_R, lean))
    shoulder = add(top, polar(ARM_FWD, lean + 90))
    parts = [line([bottom, top], TORSO_W),
             f'<circle cx="{head[0]:.2f}" cy="{head[1]:.2f}" r="{HEAD_R}" fill="{INK}"/>']
    return parts, shoulder


def praying_arm(shoulder, lean=0.0, hands_angle=0.0):
    """Foldede hender foran brystet. Overarmen ligger inne i kroppen, så bare underarmen og
    hendene stikker frem fra brystet; da trengs ingen hvit kant rundt armen."""
    elbow = add(shoulder, polar(7.4, 170 + lean))   # overarmen ned langs brystet
    wrist = add(elbow, polar(8.8, 50 + lean))       # underarmen opp og frem, med tydelig luft til brystet
    tips = add(wrist, polar(2.8, hands_angle))      # retningen hendene peker (0° = rett opp)
    return [line([shoulder, elbow, wrist, tips], ARM_W)], (max(wrist[0], tips[0]), tips[1])


def standing():
    ankle_y = FLOOR - LEG_W / 2
    hip = (24.0, ankle_y - SHIN - THIGH)
    knee = (hip[0], hip[1] + THIGH)
    ankle = (hip[0], ankle_y)
    toe = (ankle[0] + FOOT, ankle_y)
    body, shoulder = upper_body(hip)
    hands_part, hands = praying_arm(shoulder)
    parts = [line([hip, knee, ankle, toe], LEG_W)] + body + hands_part
    return parts, (hip[0] - TORSO_W / 2, max(toe[0] + LEG_W / 2, hands[0] + ARM_W / 2), hip[0])


def seated():
    ankle_y = FLOOR - LEG_W / 2
    knee_y = ankle_y - SHIN
    hip = (20.0, knee_y)
    knee = (hip[0] + THIGH, knee_y)
    ankle = (knee[0], ankle_y)
    toe = (ankle[0] + FOOT, ankle_y)
    body, shoulder = upper_body(hip)
    # Kropp og sete tegnes som én form: rund topp, rett rygg ned til setet og et avrundet hjørne
    # med samme radius som lemmene der figuren sitter. Én form gir ingen skjøt i ryggen.
    top_y = hip[1] - HIP_DROP - TORSO_L
    R = TORSO_W / 2
    r = LEG_W / 2
    back, front = hip[0] - R, hip[0] + R
    bottom_y = hip[1] + LEG_W / 2
    body[0] = (f'<path d="M{back:.2f} {top_y:.2f} A{R} {R} 0 0 1 {front:.2f} {top_y:.2f} '
               f'V{bottom_y:.2f} H{back + r:.2f} A{r} {r} 0 0 1 {back:.2f} {bottom_y - r:.2f} Z" fill="{INK}"/>')
    # Stolen: ryggen er også bakre bein; setet og fremre bein henger sammen
    seat_y = hip[1] + LEG_W / 2 + 1.4 + CHAIR_W / 2
    back_x = hip[0] - TORSO_W / 2 - 2.4 - CHAIR_W / 2
    front_x = knee[0] - LEG_W / 2 - 2.2 - CHAIR_W / 2
    chair_floor = FLOOR - CHAIR_W / 2
    chair = [line([(back_x, hip[1] - 13.5), (back_x, chair_floor)], CHAIR_W),
             # Setet begynner litt inne i ryggstolpen, så den runde enden ikke lager en flik på utsiden
             line([(back_x + 0.6, seat_y), (front_x, seat_y), (front_x, chair_floor)], CHAIR_W)]
    # Hendene hviler i fanget og forsvinner i omrisset, så armen tegnes ikke
    parts = chair + body + [line([hip, knee, ankle, toe], LEG_W)]
    return parts, (back_x - CHAIR_W / 2, toe[0] + LEG_W / 2, (back_x + toe[0]) / 2)


def kneeling():
    knee_y = FLOOR - LEG_W / 2
    hip = (24.0, knee_y - THIGH)
    knee = (hip[0], knee_y)
    ankle = (knee[0] - SHIN, knee_y)          # leggen ligger på gulvet bak kneet
    body, shoulder = upper_body(hip, lean=7)  # lener seg litt frem i bønn
    hands_part, hands = praying_arm(shoulder, lean=7, hands_angle=21)  # hendene følger kroppen som lener seg frem
    parts = [line([hip, knee, ankle], LEG_W)] + body + hands_part
    return parts, (ankle[0] - LEG_W / 2, hands[0] + ARM_W / 2, hip[0])


def svg(title, parts, extent):
    # Midtstill figuren for øyet: halvveis mellom midten av omrisset og midten av kroppen,
    # så hender og føtter som stikker ut, ikke skyver kroppen til siden.
    lo, hi, body_x = extent
    dx = SIZE / 2 - ((lo + hi) / 2 + body_x) / 2
    # Skaler alle tre likt, slik at den stående figuren fyller feltet fra 1 enhet under toppen
    # ned til gulvet. Gulvet og midtlinjen ligger fast.
    standing_height = (LEG_W / 2 + SHIN + THIGH + HIP_DROP + TORSO_L + TORSO_W / 2 + NECK + 2 * HEAD_R)
    k = (FLOOR - 1.0) / standing_height
    tx = k * dx + SIZE / 2 * (1 - k)
    ty = FLOOR * (1 - k)
    body = "\n    ".join(parts)
    # Feltet er like høyt for alle (gulvet ligger likt), men bare så bredt som figuren, så ikonene
    # kan stå tett i margen. Litt luft på hver side, så kantutjevningen ikke klippes.
    pad = 0.6
    x0 = k * lo + tx - pad
    w = k * (hi - lo) + 2 * pad
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.2f} 0 {w:.2f} {SIZE}" width="{w:.2f}" height="{SIZE}" role="img" aria-label="{title}">
  <title>{title}</title>
  <g transform="translate({tx:.3f} {ty:.3f}) scale({k:.4f})">
    {body}
  </g>
</svg>
'''


if __name__ == "__main__":
    for name, title, fn in [("staende", "Stå", standing), ("sittende", "Sitt", seated), ("knelende", "Knel", kneeling)]:
        parts, extent = fn()
        (HERE / f"{name}.svg").write_text(svg(title, parts, extent), encoding="utf-8")
        print(f"{name}.svg")
