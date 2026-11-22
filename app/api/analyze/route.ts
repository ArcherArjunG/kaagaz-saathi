import { createCanvas } from "@napi-rs/canvas";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { guardRequest } from "@/lib/auth";
import { explainDocument, runOcr } from "@/lib/google-cloud";
import type { Language } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 3_800_000;
const MAX_PDF_PAGES = 8;

async function renderPdf(buffer: Uint8Array) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(join(process.cwd(), "vendor", "pdf.worker.mjs")).href;
  const pdf = await pdfjs.getDocument({ data: buffer, useSystemFonts: true }).promise;
  if (pdf.numPages > MAX_PDF_PAGES) {
    await pdf.destroy();
    throw new Error(`This first version supports PDFs up to ${MAX_PDF_PAGES} pages. Split the PDF and upload the relevant pages.`);
  }
  const images: Array<{ content: string; mimeType: string }> = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const initial = page.getViewport({ scale: 1.7 });
    const scale = Math.min(1, 2100 / Math.max(initial.width, initial.height));
    const viewport = page.getViewport({ scale: 1.7 * scale });
    const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
    const context = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    await page.render({ canvas: canvas as unknown as HTMLCanvasElement, canvasContext: context, viewport }).promise;
    images.push({ content: canvas.toBuffer("image/jpeg", 82).toString("base64"), mimeType: "image/jpeg" });
    page.cleanup();
  }
  await pdf.destroy();
  return images;
}

export async function POST(request: Request) {
  const denied = guardRequest(request);
  if (denied) return denied;
  try {
    const form = await request.formData();
    const upload = form.get("file");
    const language = form.get("language");
    if (!(upload instanceof File)) return Response.json({ error: "Choose a photo or PDF first." }, { status: 400 });
    if (upload.size > MAX_BYTES) return Response.json({ error: "This file is over 3.8 MB. Choose a smaller file or compress it first." }, { status: 413 });
    if (!["mr", "hi", "en"].includes(String(language))) return Response.json({ error: "Choose Marathi, Hindi, or English." }, { status: 400 });

    const bytes = new Uint8Array(await upload.arrayBuffer());
    let images: Array<{ content: string; mimeType: string }>;
    if (upload.type === "application/pdf" || upload.name.toLowerCase().endsWith(".pdf")) {
      images = await renderPdf(bytes);
    } else if (["image/jpeg", "image/png", "image/webp"].includes(upload.type)) {
      images = [{ content: Buffer.from(bytes).toString("base64"), mimeType: upload.type }];
    } else {
      return Response.json({ error: "Use a PDF, JPG, PNG, or WebP image." }, { status: 415 });
    }

    const ocrText = await runOcr(images);
    const result = await explainDocument(ocrText, language as Language);
    return Response.json({ result, ocrText }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("KaagazSathi analysis error:", error instanceof Error ? error.message : "Unknown error");
    const message = error instanceof Error ? error.message : "Something went wrong while reading the document.";
    return Response.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}

