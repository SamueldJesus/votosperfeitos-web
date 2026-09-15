import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { GeneratedVow, StoredOrder, Tone } from "./types";

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 58;
const BODY_SIZE = 13;
const LINE_HEIGHT = 21;

function safePdfText(value: string): string {
  return value
    .replace(/[—–]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .normalize("NFC")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "");
}

function wrapText(text: string, font: PDFFont, size: number, width: number): string[] {
  const lines: string[] = [];

  for (const paragraph of safePdfText(text).split(/\n+/)) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }

    if (line) {
      lines.push(line);
    }
    lines.push("");
  }

  return lines;
}

export function makePdfFilename(tone: Tone, variationId: GeneratedVow["id"]): string {
  return `votos-${tone}-variacao-${variationId}.pdf`;
}

export async function renderVowPdf(vow: GeneratedVow, order: StoredOrder): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const titleFont = await document.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await document.embedFont(StandardFonts.TimesRoman);
  const accent = rgb(0.70, 0.56, 0.27);
  const text = rgb(0.11, 0.10, 0.09);
  const muted = rgb(0.45, 0.42, 0.39);
  let page!: PDFPage;
  let cursorY = 0;

  const addPage = () => {
    page = document.addPage(A4);
    cursorY = A4[1] - MARGIN;
    page.drawText("VotosPerfeitos", { x: MARGIN, y: cursorY, size: 11, font: titleFont, color: accent });
    page.drawText(`Variação ${vow.id}`, { x: A4[0] - MARGIN - 58, y: cursorY, size: 9, font: bodyFont, color: muted });
    cursorY -= 46;
  };

  addPage();
  page.drawText(safePdfText(vow.title), { x: MARGIN, y: cursorY, size: 26, font: titleFont, color: text });
  cursorY -= 32;
  page.drawText(safePdfText(vow.subtitle), { x: MARGIN, y: cursorY, size: 12, font: bodyFont, color: accent });
  cursorY -= 44;

  for (const line of wrapText(vow.body, bodyFont, BODY_SIZE, A4[0] - MARGIN * 2)) {
    if (cursorY < MARGIN + LINE_HEIGHT) {
      addPage();
    }
    if (line) {
      page.drawText(line, { x: MARGIN, y: cursorY, size: BODY_SIZE, font: bodyFont, color: text });
    }
    cursorY -= LINE_HEIGHT;
  }

  const pages = document.getPages();
  for (const [index, currentPage] of pages.entries()) {
    currentPage.drawText(safePdfText(`${order.answers.speakerName} & ${order.answers.partnerName}`), {
      x: MARGIN,
      y: 28,
      size: 9,
      font: bodyFont,
      color: muted,
    });
    currentPage.drawText(`Página ${index + 1} de ${pages.length}`, {
      x: A4[0] - MARGIN - 64,
      y: 28,
      size: 9,
      font: bodyFont,
      color: muted,
    });
  }

  document.setTitle(`Votos personalizados - variação ${vow.id}`);
  document.setAuthor("VotosPerfeitos");
  return document.save();
}
