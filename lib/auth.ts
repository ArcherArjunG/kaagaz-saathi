import { GoogleAuth } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/cloud-platform"];
let googleAuth: GoogleAuth | undefined;

export function guardRequest(request: Request): Response | null {
  const expected = process.env.APP_ACCESS_CODE;
  if (!expected) {
    return Response.json(
      { error: "The app is not configured yet. Set APP_ACCESS_CODE in the server environment." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (request.headers.get("x-app-access-code") !== expected) {
    return Response.json(
      { error: "Enter the app access code to continue." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
  return null;
}

export async function getGoogleAccessToken(): Promise<string> {
  if (!googleAuth) {
    const raw = process.env.GCP_SERVICE_ACCOUNT_JSON;
    let credentials: Record<string, unknown> | undefined;
    if (raw) {
      try {
        credentials = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        throw new Error("GCP_SERVICE_ACCOUNT_JSON is not valid JSON.");
      }
    }
    googleAuth = new GoogleAuth({ credentials: credentials as never, scopes: SCOPES });
  }

  try {
    const client = await googleAuth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;
    if (!token) throw new Error("Google Cloud authentication did not return an access token.");
    return token;
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/default credentials|application_default_credentials/i.test(message)) {
      throw new Error("Google Cloud is not connected yet. Add server-side credentials before analyzing documents.");
    }
    throw error;
  }
}

export function requireProject(): string {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) throw new Error("Set GOOGLE_CLOUD_PROJECT in the server environment.");
  return project;
}
