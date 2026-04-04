FUENTES AUTOALOJADAS (opcional)
═══════════════════════════════

Por defecto la web carga Barlow Condensed y Nunito Sans desde Google Fonts.
Si prefieres alojar las fuentes en tu propio servidor (mejor privacidad y rendimiento sin dependencia externa):

1. Descarga las fuentes en:
   - https://fonts.google.com/specimen/Barlow+Condensed
   - https://fonts.google.com/specimen/Nunito+Sans

2. Convierte a WOFF2 (formato moderno, máxima compresión):
   - Herramienta online: https://cloudconvert.com/ttf-to-woff2

3. Coloca los archivos en esta carpeta:
   assets/fonts/
   ├── BarlowCondensed-Bold.woff2
   ├── BarlowCondensed-ExtraBold.woff2
   ├── BarlowCondensed-Black.woff2
   ├── BarlowCondensed-BoldItalic.woff2
   ├── NunitoSans-Regular.woff2
   ├── NunitoSans-SemiBold.woff2
   └── NunitoSans-Bold.woff2

4. Añade en tokens.css (sustituye el <link> de Google Fonts en el HTML):

@font-face {
  font-family: 'Barlow Condensed';
  src: url('../fonts/BarlowCondensed-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Barlow Condensed';
  src: url('../fonts/BarlowCondensed-Black.woff2') format('woff2');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}

/* ... repetir para cada variante */

NOTA: font-display: swap garantiza que el texto se muestre
con fuente de sistema mientras cargan las personalizadas.
