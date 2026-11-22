import { guardRequest } from "@/lib/auth";
import { synthesizeSpeech } from "@/lib/google-cloud";
import type { Language } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  const denied = guardRequest(request);
  if (denied) return denied;
  try {
    const body = await request.json() as { text?: string; language?: Language };
    const text = body.text?.trim().slice(0, 4500) || "";
    if (!text) return Response.json({ error: "There is no explanation to read aloud yet." }, { status: 400 });
    if (!["mr", "hi", "en"].includes(String(body.language))) return Response.json({ error: "Choose Marathi, Hindi, or English." }, { status: 400 });
    const audio = await synthesizeSpeech(text, body.language as Language);
    return Response.json({ audio }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("KaagazSathi speech error:", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: error instanceof Error ? error.message : "Could not create audio." }, { status: 500 });
  }
}
