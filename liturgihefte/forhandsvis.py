#!/usr/bin/env python3
"""Forhåndsvisning av liturgiheftet i nettleseren.

Bygger PDF-en på nytt hver gang familiemesse.html, hefte.css, bildene eller ikonene lagres,
og viser sidene som oppslag slik de blir i det stiftede heftet. Siden i nettleseren
oppdaterer seg selv.

    uv run --no-project --with weasyprint==70.0 python forhandsvis.py   # http://127.0.0.1:8765
"""
import hashlib
import http.server
import json
import pathlib
import shutil
import subprocess
import sys
import threading
import time
import traceback

ROOT = pathlib.Path(__file__).resolve().parent
CACHE = ROOT / "pdf" / "forhandsvisning"
SHARED = [ROOT / "hefte.css", ROOT / "bilder", ROOT / "ikoner"]  # endringer her bygger alle heftene
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8765

# Heftene som vises (i dag bare ett). Et hefte uten HTML-fil hoppes over til filen finnes.
HEFTER = {
    "nb": {"navn": "Norsk", "html": ROOT / "familiemesse.html", "pdf": ROOT / "pdf" / "familiemesse-a5.pdf"},
}
states = {key: {"version": 0, "pages": [], "error": None, "building": False, "builtAt": None, "seconds": None}
          for key in HEFTER}


def snapshot(key):
    files = [HEFTER[key]["html"]]
    for p in SHARED:
        files += sorted(p.rglob("*")) if p.is_dir() else [p]
    return tuple((str(f), f.stat().st_mtime_ns) for f in files if f.exists())


def build(key):
    from weasyprint import HTML

    hefte, state = HEFTER[key], states[key]
    state["building"] = True
    started = time.monotonic()
    version = state["version"] + 1
    target = CACHE / key / f"v{version}"
    try:
        shutil.rmtree(target, ignore_errors=True)
        target.mkdir(parents=True)
        HTML(filename=str(hefte["html"])).write_pdf(str(hefte["pdf"]))
        subprocess.run(["pdftoppm", "-r", "130", "-png", str(hefte["pdf"]), str(target / "s")], check=True)
        pages = []
        for f in sorted(target.glob("s-*.png"), key=lambda f: int(f.stem.split("-")[1])):
            n = int(f.stem.split("-")[1])
            f.rename(target / f"{n}.png")
            pages.append({"n": n, "hash": hashlib.md5((target / f"{n}.png").read_bytes()).hexdigest()})
        state.update(pages=pages, error=None)
    except Exception:
        state["error"] = traceback.format_exc(limit=3)
    finally:
        state.update(version=version, building=False, builtAt=time.strftime("%H:%M:%S"),
                     seconds=round(time.monotonic() - started, 1))
        for old in (CACHE / key).glob("v*"):
            if old.name not in (f"v{version}", f"v{version - 1}"):
                shutil.rmtree(old, ignore_errors=True)


def watch():
    seen = {}
    while True:
        for key, hefte in HEFTER.items():
            if not hefte["html"].exists():
                continue
            now = snapshot(key)
            if now != seen.get(key):
                time.sleep(0.15)  # la lagringen bli ferdig
                seen[key] = snapshot(key)
                build(key)
        time.sleep(0.4)


VIEWER = """<!doctype html>
<html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Liturgihefte – forhåndsvisning</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; background: #4a4d50; font: 14px system-ui, sans-serif; color: #eee; }
  header { position: sticky; top: 0; z-index: 1; display: flex; flex-wrap: wrap; gap: 6px 18px; align-items: center;
           padding: 10px 16px; background: #2b2e31; box-shadow: 0 1px 6px rgba(0,0,0,.4); }
  header a { color: #9cf; }
  .advarsel { color: #ffd479; } .feil { color: #ffb4a8; } .bygger { color: #9cf; }
  pre.feil { margin: 16px; white-space: pre-wrap; }
  main { display: flex; flex-direction: column; align-items: center; gap: 28px; padding: 28px 16px 60px; }
  .oppslag { display: flex; gap: 0; }
  .side { position: relative; width: min(44vw, 520px); aspect-ratio: 148 / 210; }
  .side img { width: 100%; height: 100%; display: block; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,.45); }
  .side.tom { visibility: hidden; }
  .side .nr { position: absolute; bottom: -20px; width: 100%; text-align: center; font-size: 12px; color: #bbb; }
  .side.endret img { outline: 4px solid #ffd479; transition: outline-color 2.5s; }
  .side.endret.ferdig img { outline-color: transparent; }
  body.enkelt .oppslag { flex-direction: column; gap: 28px; }
  body.enkelt .side.tom { display: none; }
</style></head>
<body>
<header>
  <strong>Liturgihefte – familiemesse</strong>
  <span id="hefter"></span>
  <span id="info">Kobler til …</span>
  <a id="pdf" href="/pdf" target="_blank">Åpne PDF</a>
  <label><input type="checkbox" id="enkelt"> Én side om gangen</label>
</header>
<pre id="feil" class="feil" hidden></pre>
<main id="sider"></main>
<script>
  let versjon = -1, forrige = {};
  const HEFTE = new URLSearchParams(location.search).get("hefte") || "nb";
  const el = id => document.getElementById(id);
  el("pdf").href = `/pdf?hefte=${HEFTE}`;
  el("enkelt").addEventListener("change", e => document.body.classList.toggle("enkelt", e.target.checked));

  function side(p, v) {
    const d = document.createElement("div");
    d.className = "side";
    if (!p) { d.classList.add("tom"); return d; }
    const img = document.createElement("img");
    img.src = `/side/${HEFTE}/v${v}/${p.n}.png`;
    img.alt = `Side ${p.n}`;
    const nr = document.createElement("div");
    nr.className = "nr"; nr.textContent = p.n;
    d.append(img, nr);
    if (forrige[p.n] && forrige[p.n] !== p.hash) {
      d.classList.add("endret");
      setTimeout(() => d.classList.add("ferdig"), 1500);
    }
    return d;
  }

  function tegn(s) {
    const sider = s.pages, main = el("sider");
    const rader = [[null, sider[0]]];
    for (let i = 1; i < sider.length; i += 2) rader.push([sider[i], sider[i + 1] || null]);
    main.replaceChildren(...rader.filter(r => r[0] || r[1]).map(([v, h]) => {
      const o = document.createElement("div");
      o.className = "oppslag";
      o.append(side(v, s.version), side(h, s.version));
      return o;
    }));
    forrige = Object.fromEntries(sider.map(p => [p.n, p.hash]));
  }

  function info(s) {
    const n = s.pages.length, deler = [];
    if (s.building) deler.push('<span class="bygger">Bygger …</span>');
    deler.push(`${n} sider`);
    if (n % 4) deler.push(`<span class="advarsel">ikke delelig med 4 (trenger ${Math.ceil(n / 4) * 4})</span>`);
    if (s.builtAt) deler.push(`oppdatert ${s.builtAt} (${s.seconds} s)`);
    el("info").innerHTML = deler.join(" · ");
    el("feil").hidden = !s.error;
    el("feil").textContent = s.error || "";
  }

  async function sjekk() {
    try {
      const s = await (await fetch(`/status?hefte=${HEFTE}`, { cache: "no-store" })).json();
      el("hefter").innerHTML = s.hefter.length < 2 ? "" : s.hefter.map(h => h.key === HEFTE ? `<b>${h.navn}</b>` : `<a href="/?hefte=${h.key}">${h.navn}</a>`).join(" · ");
      if (s.version !== versjon && !s.building) { versjon = s.version; if (!s.error) tegn(s); }
      info(s);
    } catch { el("info").innerHTML = '<span class="feil">Forhåndsvisningen er stoppet</span>'; }
    setTimeout(sjekk, 600);
  }
  sjekk();
</script>
</body></html>
"""


ICONS = ROOT / "ikoner"

ICON_VIEWER = """<!doctype html>
<html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ikoner – forhåndsvisning</title>
<style>
  body { margin: 0; background: #fff; color: #222; font: 14px system-ui, sans-serif; }
  header { position: sticky; top: 0; display: flex; gap: 18px; align-items: center; padding: 10px 16px;
           background: #2b2e31; color: #eee; }
  header a { color: #9cf; }
  main { padding: 24px 16px 60px; display: grid; gap: 36px; }
  h2 { font-size: 13px; font-weight: 600; color: #666; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .04em; }
  .rad { display: flex; flex-wrap: wrap; gap: 28px; align-items: flex-end; }
  figure { margin: 0; text-align: center; }
  figcaption { font-size: 12px; color: #777; margin-top: 6px; }
  .stor img { width: 260px; height: 260px; outline: 1px solid #e3e3e3; background:
              linear-gradient(#f2f2f2 1px, transparent 1px) 0 0 / 32.5px 32.5px,
              linear-gradient(90deg, #f2f2f2 1px, transparent 1px) 0 0 / 32.5px 32.5px; }
  .rad img.s96 { width: 96px; height: 96px; } .rad img.s48 { width: 48px; height: 48px; }
  .rad img.s32 { width: 32px; height: 32px; } .rad img.s24 { width: 24px; height: 24px; }
  .rad img.s16 { width: 16px; height: 16px; }
  /* Omtrent trykkstørrelse: 5 mm høye ved siden av en rubrikk i 12 pt Times */
  .tekst { font: 12pt "Times New Roman", "Liberation Serif", serif; line-height: 1.6; max-width: 34em; }
  .tekst img { width: 5mm; height: 5mm; vertical-align: -1.2mm; margin-right: 1.5mm; }
  .tekst .r { color: #c00000; font-style: italic; }
  .tekst b { color: #4472c4; }
  .stamp { font-size: 12px; color: #aaa; }
</style></head>
<body>
<header><strong>Ikoner – stå, sitt, knel</strong><span id="info"></span><a href="/">Til heftet</a></header>
<main>
  <section><h2>Stort, med rutenett (48 × 48)</h2><div class="rad stor" id="stor"></div></section>
  <section><h2>Små størrelser (96, 48, 32, 24, 16 px)</h2><div id="smaa"></div></section>
  <section><h2>I teksten, omtrent som i heftet (5 mm)</h2><div class="tekst" id="tekst"></div></section>
</main>
<script>
  let stamp = null;
  const navn = { staende: "Stående", sittende: "Sittende", knelende: "Knelende" };
  const img = (n, cls, v) => `<img class="${cls || ""}" src="/ikoner/${n}.svg?v=${v}" alt="${navn[n] || n}">`;
  function tegn(s) {
    const v = s.stamp, ikoner = ["staende", "sittende", "knelende"].filter(n => s.icons.includes(n));
    document.getElementById("stor").innerHTML = ikoner.map(n => `<figure>${img(n, "", v)}<figcaption>${navn[n]}</figcaption></figure>`).join("");
    document.getElementById("smaa").innerHTML = ["s96", "s48", "s32", "s24", "s16"].map(c =>
      `<div class="rad" style="margin-bottom:14px">${ikoner.map(n => img(n, c, v)).join("")}</div>`).join("");
    document.getElementById("tekst").innerHTML =
      `<p>${img("staende", "", v)}<b>Prest:</b> Herren være med dere.<br>${img("staende", "", v)}<b>Alle:</b> <em>Og med din ånd.</em></p>` +
      `<p>${img("sittende", "", v)}<span class="r">Responsoriesalme</span></p>` +
      `<p>${img("knelende", "", v)}TA OG ET ALLE DERAV: FOR DETTE ER MITT LEGEME …</p>`;
    document.getElementById("info").textContent = "oppdatert " + new Date().toLocaleTimeString("nb-NO");
  }
  async function sjekk() {
    try {
      const s = await (await fetch("/ikoner/status", { cache: "no-store" })).json();
      if (s.stamp !== stamp) { stamp = s.stamp; tegn(s); }
    } catch { document.getElementById("info").textContent = "Forhåndsvisningen er stoppet"; }
    setTimeout(sjekk, 700);
  }
  sjekk();
</script>
</body></html>
"""


class Handler(http.server.BaseHTTPRequestHandler):
    def send(self, body, ctype, status=200):
        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path, _, query = self.path.partition("?")
        key = dict(q.split("=", 1) for q in query.split("&") if "=" in q).get("hefte", "nb")
        if key not in HEFTER:
            key = "nb"
        if path == "/":
            return self.send(VIEWER.encode(), "text/html; charset=utf-8")
        if path == "/status":
            hefter = [{"key": k, "navn": h["navn"]} for k, h in HEFTER.items() if h["html"].exists()]
            return self.send(json.dumps({**states[key], "hefter": hefter}).encode(), "application/json")
        if path == "/pdf" and HEFTER[key]["pdf"].exists():
            return self.send(HEFTER[key]["pdf"].read_bytes(), "application/pdf")
        if path == "/ikoner":
            return self.send(ICON_VIEWER.encode(), "text/html; charset=utf-8")
        if path == "/ikoner/status":
            svgs = sorted(ICONS.glob("*.svg"))
            stamp = max((f.stat().st_mtime_ns for f in svgs), default=0)
            return self.send(json.dumps({"stamp": stamp, "icons": [f.stem for f in svgs]}).encode(), "application/json")
        parts = path.strip("/").split("/")
        if len(parts) == 2 and parts[0] == "ikoner" and parts[1].endswith(".svg"):
            f = ICONS / parts[1]
            if f.resolve().parent == ICONS.resolve() and f.exists():
                return self.send(f.read_bytes(), "image/svg+xml")
        if len(parts) == 4 and parts[0] == "side" and parts[1] in HEFTER and parts[2].startswith("v") and parts[3].endswith(".png"):
            f = CACHE / parts[1] / parts[2] / parts[3]
            if f.resolve().parent.parent == (CACHE / parts[1]).resolve() and f.exists():
                return self.send(f.read_bytes(), "image/png")
        self.send(b"Finnes ikke", "text/plain; charset=utf-8", 404)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    threading.Thread(target=watch, daemon=True).start()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Forhåndsvisning: http://127.0.0.1:{PORT}", flush=True)
    server.serve_forever()
