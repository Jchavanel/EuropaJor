#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  Europa Jor — Servidor de demo local
#  Uso: ./iniciar-demo.sh  (o doble clic en macOS)
# ─────────────────────────────────────────────────────────────

PORT=8000
URL="http://localhost:$PORT/index.html"

echo ""
echo "  ████████████████████████████████████████████"
echo "  █   EUROPA JOR — Servidor de demo local    █"
echo "  ████████████████████████████████████████████"
echo ""
echo "  URL: $URL"
echo "  Pulsa Ctrl+C para detener."
echo ""

# Abrir el navegador automáticamente según el SO
open_browser() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "$URL"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "$URL" 2>/dev/null || true
    fi
}

# Buscar servidor disponible
if command -v python3 &>/dev/null; then
    echo "  Usando Python 3..."
    sleep 1 && open_browser &
    python3 -m http.server $PORT
elif command -v python &>/dev/null; then
    echo "  Usando Python..."
    sleep 1 && open_browser &
    python -m http.server $PORT
elif command -v npx &>/dev/null; then
    echo "  Usando Node.js / npx..."
    sleep 1 && open_browser &
    npx serve -l $PORT .
else
    echo "  ERROR: No se encontró Python ni Node.js."
    echo ""
    echo "  Instala Python desde: https://www.python.org/downloads/"
    echo "  o Node.js desde:      https://nodejs.org/"
    echo ""
    read -p "  Pulsa Enter para cerrar..."
    exit 1
fi
