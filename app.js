import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/build/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs';

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const statusText = document.getElementById('statusText');

const setStatus = (message) => {
  statusText.textContent = message;
};

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const renderPageToHtml = async (page) => {
  const viewport = page.getViewport({ scale: 1.5 });
  const textContent = await page.getTextContent();

  const textSpans = textContent.items
    .map((item) => {
      const [a, b, c, d, e, f] = item.transform;
      const x = e;
      const y = viewport.height - f;
      const fontSize = Math.max(Math.hypot(a, b), Math.hypot(c, d), 10);
      const safe = escapeHtml(item.str || '');
      return `<span style="left:${x}px;top:${y}px;font-size:${fontSize}px;">${safe}</span>`;
    })
    .join('');

  return `
    <section class="pdf-page" style="width:${viewport.width}px;height:${viewport.height}px;">
      ${textSpans}
    </section>
  `;
};

const openRenderedDeck = (pagesMarkup) => {
  const previewWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (!previewWindow) {
    setStatus('Popup blockiert. Bitte Popups erlauben und erneut versuchen.');
    return;
  }

  previewWindow.document.write(`
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Teraloomy Preview</title>
        <style>
          body {
            margin: 0;
            background: #0b1020;
            color: #e5e7eb;
            font-family: Inter, system-ui, sans-serif;
            padding: 24px;
            display: grid;
            gap: 24px;
            place-items: center;
          }

          .pdf-page {
            position: relative;
            background: #fff;
            color: #111827;
            box-shadow: 0 18px 38px rgba(0, 0, 0, 0.38);
            overflow: hidden;
          }

          .pdf-page span {
            position: absolute;
            white-space: pre;
            transform: translateY(-100%);
            line-height: 1;
            transform-origin: left top;
          }
        </style>
      </head>
      <body>
        ${pagesMarkup}
      </body>
    </html>
  `);

  previewWindow.document.close();
  setStatus('Fertig: PDF wurde als HTML in neuem Fenster geöffnet.');
};

const processPdfFile = async (file) => {
  if (!file || file.type !== 'application/pdf') {
    setStatus('Bitte eine gültige PDF-Datei auswählen.');
    return;
  }

  setStatus(`Verarbeite: ${file.name}`);

  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;

    setStatus(`PDF geladen (${pdf.numPages} Seiten). Erstelle HTML …`);

    let pagesMarkup = '';
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      pagesMarkup += await renderPageToHtml(page);
    }

    openRenderedDeck(pagesMarkup);
  } catch (error) {
    console.error(error);
    setStatus('Fehler beim PDF-Import. Details siehe Konsole.');
  }
};

const onDrop = async (event) => {
  event.preventDefault();
  dropzone.classList.remove('drag-active');

  const file = event.dataTransfer?.files?.[0];
  await processPdfFile(file);
};

dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.classList.add('drag-active');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('drag-active');
});

dropzone.addEventListener('drop', onDrop);

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  await processPdfFile(file);
  fileInput.value = '';
});
