import { guardRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const denied = guardRequest(request);
  if (denied) return denied;
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
