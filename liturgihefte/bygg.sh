#!/usr/bin/env bash
# Lager PDF av liturgiheftet: én A5-side per side, i leserekkefølge.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p pdf
uvx --quiet weasyprint@70.0 familiemesse.html pdf/familiemesse-a5.pdf
sider=$(pdfinfo pdf/familiemesse-a5.pdf | awk '/^Pages:/ {print $2}')
echo "pdf/familiemesse-a5.pdf: $sider sider"
# Nettsiden (/messen og /messen/i-dag) viser den samme teksten
python3 til-nettsiden.py
if (( sider % 4 != 0 )); then
  echo "Advarsel: $sider sider er ikke delelig med 4. Et stiftet hefte trenger 4, 8, 12, 16, 20 ... sider." >&2
fi
