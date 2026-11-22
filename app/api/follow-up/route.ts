import { askAboutDocument } from "@/lib/google-cloud";
import { guardRequest } from "@/lib/auth";
import type { Language } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const denied = guardRequest(request);
  if (denied) return denied;
  try {
    const body = await request.json() as { documentText?: string; question?: string; language?: Language; docCategory?: string };
    const documentText = body.documentText?.slice(0, 50_000) || "";
    const question = body.question?.trim().slice(0, 1000) || "";
    if (!documentText || !question) return Response.json({ error: "Add a question about the document." }, { status: 400 });
    if (!["mr", "hi", "en"].includes(String(body.language))) return Response.json({ error: "Choose Marathi, Hindi, or English." }, { status: 400 });
    const category = ["pension_ppo", "health_insurance", "bank_kyc_form", "other"].includes(String(body.docCategory)) ? String(body.docCategory) : "other";
    const answer = await askAboutDocument(documentText, question, body.language as Language, category);
    return Response.json({ answer }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("KaagazSathi follow-up error:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: error instanceof Error ? error.message : "Could not answer that question." }, { status: 500 });
  }
}
