#!/usr/bin/env python3
"""Henter messens ordning fra liturgiheftet til nettsiden (/messen og /messen/i-dag).

Skriver web/src/content/messens-ordning.json og kopierer ikonene for kroppsstilling til
web/public/liturgi/. bygg.sh kjører dette, så nettsiden følger heftet. Testen
web/tests/order-of-mass.test.mjs feiler hvis heftet er endret uten at dette er kjørt.

Med --sjekk skrives ingenting; skriptet feiler bare hvis nettsiden ikke følger heftet.
"""

import hashlib
import html
import json
import pathlib
import re
import sys
from html.parser import HTMLParser

HER = pathlib.Path(__file__).resolve().parent
KILDE = HER / "familiemesse.html"
WEB = HER.parent / "web"
UT = WEB / "src" / "content" / "messens-ordning.json"
IKONMAPPE = WEB / "public" / "liturgi"
IKONER = ["staende", "sittende", "knelende"]

TOMME = {"br", "img", "meta", "link"}
# Klasser som bare styrer sideskift og plassering i det trykte heftet
TRYKKLASSER = {"ny-side", "ny-venstre", "hold-sammen", "hel", "tittel"}


class Node:
    def __init__(self, tag, attrs, parent):
        self.tag, self.attrs, self.parent, self.barn = tag, dict(attrs), parent, []

    def klasser(self):
        return set((self.attrs.get("class") or "").split())


class Tre(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rot = Node("rot", {}, None)
        self.her = self.rot

    def handle_starttag(self, tag, attrs):
        node = Node(tag, attrs, self.her)
        self.her.barn.append(node)
        if tag not in TOMME:
            self.her = node

    def handle_endtag(self, tag):
        node = self.her
        while node is not self.rot and node.tag != tag:
            node = node.parent
        if node is not self.rot:
            self.her = node.parent

    def handle_data(self, data):
        self.her.barn.append(data)


def elementer(node):
    return [barn for barn in node.barn if isinstance(barn, Node)]


def tekst(node):
    """Synlig tekst uten ikonene for kroppsstilling, med sammenslått mellomrom."""
    if isinstance(node, str):
        return node
    if node.tag == "img" or "stilling" in node.klasser():
        return ""
    return "".join(tekst(barn) for barn in node.barn)


def ren(verdi):
    return re.sub(r"\s+", " ", verdi).strip()


def som_html(node):
    if isinstance(node, str):
        return html.escape(node, quote=False)
    if node.tag == "img":
        # Ikonene blir CSS-masker i tekstfargen; bildene i heftet tas ikke med.
        if node.parent and "stilling" in node.parent.klasser():
            navn = pathlib.Path(node.attrs["src"]).stem
            alt = html.escape(node.attrs.get("alt", ""))
            return f'<span class="ikon ikon-{navn}" role="img" aria-label="{alt}"></span>'
        return ""
    attributter = ""
    for navn in ("id", "class", "lang"):
        verdi = node.attrs.get(navn)
        if navn == "class" and verdi:
            verdi = " ".join(k for k in verdi.split() if k not in TRYKKLASSER)
        if verdi:
            attributter += f' {navn}="{html.escape(verdi)}"'
    if node.tag in TOMME:
        return f"<{node.tag}{attributter}>"
    indre = "".join(som_html(barn) for barn in node.barn)
    return f"<{node.tag}{attributter}>{indre}</{node.tag}>"


def deler(noder):
    """Deler en rekke toppnivåelementer i hoveddeler, én per h2."""
    resultat = []
    for node in noder:
        if node.tag == "img":
            continue
        if node.tag == "h2":
            resultat.append({"id": node.attrs["id"], "title": ren(tekst(node)), "blocks": []})
        resultat[-1]["blocks"].append({"html": som_html(node).strip()})
    return resultat


def mellom(noder, fra_id, til_id=None):
    start = next(i for i, n in enumerate(noder) if n.attrs.get("id") == fra_id)
    slutt = next((i for i, n in enumerate(noder) if til_id and n.attrs.get("id") == til_id), len(noder))
    return noder[start:slutt]


# Ledd i Ordets liturgi som byttes ut eller gjentas når dagens lesninger finnes
ROLLER = {
    "nb": {
        "ordet": "ordets-liturgi",
        "svar": "Slik lyder Herrens ord.",
        "salme": "Responsoriesalme",
        "vers": "Evangelievers",
        "evangelium": "Evangelium",
    },
    "en": {
        "ordet": "liturgy-of-the-word",
        "svar": "The word of the Lord.",
        "salme": "Responsorial Psalm",
        "vers": "Gospel Acclamation",
        "evangelium": "Gospel",
    },
}


def merk_roller(sprak, del_):
    navn = ROLLER[sprak]
    blokker = del_["blocks"]
    tekster = [ren(tekst(parse(b["html"]))) for b in blokker]

    def finn(rolle, test):
        treff = [i for i, t in enumerate(tekster) if test(t, blokker[i]["html"])]
        if len(treff) != 1:
            sys.exit(f"Fant {len(treff)} treff for {rolle} i {del_['id']}; forventet ett.")
        blokker[treff[0]]["role"] = rolle
        return treff[0]

    i = finn("reading-response-priest", lambda t, h: t == navn["svar"])
    blokker[i + 1]["role"] = "reading-response-all"
    i = finn("psalm-heading", lambda t, h: h.startswith("<h3") and t == navn["salme"])
    blokker[i + 1]["role"] = "psalm-placeholder"
    i = finn("acclamation-heading", lambda t, h: h.startswith("<h3") and t == navn["vers"])
    blokker[i + 1]["role"] = "acclamation-placeholder"
    finn("gospel-heading", lambda t, h: h.startswith("<h3") and t == navn["evangelium"])
    i = finn("gospel-placeholder", lambda t, h: t.startswith("(...)"))
    # Med lesningen på plass står bare svaret igjen: «Slik lyder Herrens ord.»
    blokker[i]["readingHtml"] = blokker[i]["html"].replace("(...) ", "", 1)


def parse(kilde):
    tre = Tre()
    tre.feed(kilde)
    return tre.rot


def lag():
    kilde = KILDE.read_text(encoding="utf-8")
    body = next(n for n in elementer(parse(kilde)) if n.tag == "html")
    body = next(n for n in elementer(body) if n.tag == "body")
    topp = elementer(body)
    engelsk = next(n for n in topp if n.tag == "section" and n.attrs.get("lang") == "en")
    engelske = elementer(engelsk)

    # Den norske messen og Angelus står foran den engelske delen
    norsk = deler(mellom(topp[: topp.index(engelsk)], "innledende-riter"))
    angelus_en = mellom(engelske, "angelus-en", "introductory-rites")
    english = deler(mellom(engelske, "introductory-rites")) + [{
        "id": "angelus",
        "title": "Angelus",
        "blocks": [{"html": '<h2 id="angelus">Angelus</h2>'}]
        + [{"html": som_html(n).strip()} for n in angelus_en[1:]],
    }]

    merk_roller("nb", next(d for d in norsk if d["id"] == ROLLER["nb"]["ordet"]))
    merk_roller("en", next(d for d in english if d["id"] == ROLLER["en"]["ordet"]))

    return {
        "source": {
            "file": "liturgihefte/familiemesse.html",
            "sha256": hashlib.sha256(kilde.encode("utf-8")).hexdigest(),
        },
        "liturgies": {"nb": {"sections": norsk}, "en": {"sections": english}},
    }


def main():
    data = json.dumps(lag(), ensure_ascii=False, indent=1) + "\n"
    ikoner = {navn: (HER / "ikoner" / f"{navn}.svg").read_bytes() for navn in IKONER}
    if "--sjekk" in sys.argv:
        utdatert = not UT.exists() or UT.read_text(encoding="utf-8") != data
        utdatert |= any(
            not (IKONMAPPE / f"{n}.svg").exists() or (IKONMAPPE / f"{n}.svg").read_bytes() != b
            for n, b in ikoner.items()
        )
        if utdatert:
            sys.exit("Nettsiden følger ikke heftet. Kjør liturgihefte/til-nettsiden.py.")
        return
    UT.parent.mkdir(parents=True, exist_ok=True)
    UT.write_text(data, encoding="utf-8")
    IKONMAPPE.mkdir(parents=True, exist_ok=True)
    for navn, innhold in ikoner.items():
        (IKONMAPPE / f"{navn}.svg").write_bytes(innhold)
    print(f"{UT.relative_to(HER.parent)}: messens ordning på norsk og engelsk")


if __name__ == "__main__":
    main()
