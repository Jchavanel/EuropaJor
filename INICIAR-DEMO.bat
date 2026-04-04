@echo off
title Europa Jor — Servidor local
color 0A
echo.
echo  ██████████████████████████████████████████
echo  █   EUROPA JOR — Servidor de demo local  █
echo  ██████████████████████████████████████████
echo.
echo  Iniciando servidor en http://localhost:8000
echo.
echo  Pulsa Ctrl+C para detener el servidor.
echo.

REM Intentar Python 3 primero
python --version >nul 2>&1
if %errorlevel%==0 (
    echo  Usando Python...
    start "" "http://localhost:8000/index.html"
    python -m http.server 8000
    goto :fin
)

python3 --version >nul 2>&1
if %errorlevel%==0 (
    echo  Usando Python3...
    start "" "http://localhost:8000/index.html"
    python3 -m http.server 8000
    goto :fin
)

REM Si no hay Python, intentar Node.js
npx --version >nul 2>&1
if %errorlevel%==0 (
    echo  Usando Node.js / npx...
    start "" "http://localhost:8000/index.html"
    npx serve -l 8000 .
    goto :fin
)

echo  ERROR: No se encontro Python ni Node.js.
echo.
echo  Instala cualquiera de estos:
echo  - Python: https://www.python.org/downloads/
echo  - Node.js: https://nodejs.org/
echo.
pause
:fin
