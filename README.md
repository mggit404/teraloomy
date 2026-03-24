# Teraloomy (Blanko-Start)

Erste lauffähige Browser-Version von Teraloomy mit:

- Drag-and-Drop PDF Upload
- PDF Parsing mit `pdf.js`
- Rekonstruktion des Text-Layers als HTML
- Ausgabe in neuem Browserfenster

## Start

Da diese Version keine Build-Toolchain benötigt, reicht ein statischer Webserver.

Beispiel mit Python:

```bash
python3 -m http.server 4173
```

Dann öffnen:

- `http://localhost:4173`

## Hinweis

Diese erste Version fokussiert auf den Text-Layer. Komplexe Layout-Elemente (vektorbasierte Formen, Bilder, Tabellen-Borders etc.) werden noch nicht vollständig nachgebaut.
