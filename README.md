# KaagazSathi

A small, deployable document explainer for Marathi, Hindi, and English. The app accepts a photo or a PDF, runs Google Cloud Vision OCR, asks Gemini on Vertex AI for a structured explanation, and can read the result aloud with Google Cloud Text-to-Speech.

## What is included

- Upload JPG, PNG, WebP, or PDF documents. PDFs are rendered in memory on the server, up to 8 pages.
- Structured output: headline, summary, amounts, deadlines, red flags, optional checks, actions, draft reply, and unclear text.
- Marathi, Hindi, and English output; follow-up questions using the extracted document text; copyable reply; audio playback.
- A server-checked access code to reduce uninvited API usage on a public demo URL.
- No database or upload bucket. This app does not save files; uploaded content is sent to Google Cloud APIs for processing.

## Run locally

Requirements: Node.js 24.x and a Google Cloud project configured for the APIs listed below. Node 24.x is available on Vercel and meets the PDF renderer's runtime requirement.

1. Copy `.env.example` to `.env.local`.
2. Set `GOOGLE_CLOUD_PROJECT` to the project ID, leave `GOOGLE_CLOUD_LOCATION=global`, and set `GEMINI_MODEL=gemini-3.5-flash` (or a current model enabled in your project).
3. Set `GCP_SERVICE_ACCOUNT_JSON` to the full service-account JSON as one line. Keep the value private and do not add a `NEXT_PUBLIC_` prefix.
4. Set `APP_ACCESS_CODE` to a long random phrase.
5. Run `pnpm install` (or `npm install`), then `pnpm dev` (or `npm run dev`), and open http://localhost:3000.
6. Enter the access code in the app. Choose a document and language, then select **Explain this document**.

Local development can also use Application Default Credentials instead of `GCP_SERVICE_ACCOUNT_JSON`; configure ADC with the Google Cloud CLI and keep `GOOGLE_CLOUD_PROJECT` set.

## Google Cloud setup walkthrough

The app uses **Vertex AI Gemini** for document understanding. It does not use an AI Studio API key. No GCP resources have been created or configured by this project scaffold.

1. In Google Cloud Console, create or select a project and make sure billing is enabled.
2. Enable these APIs in **APIs & Services → Library**:
   - Cloud Vision API (`vision.googleapis.com`)
   - Cloud Text-to-Speech API (`texttospeech.googleapis.com`)
   - Vertex AI API (`aiplatform.googleapis.com`)
3. In **IAM & Admin → Service Accounts**, create a dedicated service account for KaagazSathi.
4. Grant the service account the Agent Platform User role (`roles/aiplatform.user`) for Gemini. The project may also need Service Usage Consumer (`roles/serviceusage.serviceUsageConsumer`) for quota use. Cloud Vision image requests and Cloud TTS use the same service-account OAuth credentials; this app sends images inline and does not require a Cloud Storage bucket.
5. For the first personal demo deployment, create a JSON key for the service account and put its contents only in `.env.local` locally and the deployment provider's server-side environment variables. Never commit the JSON key, paste it into the browser, or add it to a `NEXT_PUBLIC_` variable. For a longer-lived production service, replace downloadable keys with workload identity federation where supported.
6. Check Cloud Billing budgets and usage before sharing the app URL. The access code is a simple private-demo gate, not a full user-account system.

Google Cloud's external-workload authentication guidance recommends workload identity federation for workloads running outside Google Cloud. The JSON key is a simpler first setup for this personal demo, but it is a long-lived secret and should be rotated or replaced when possible.

## Deploy to Vercel

1. Put this folder in a GitHub repository and import it into Vercel as a **Next.js** project.
2. In the Vercel project, open **Settings → Environment Variables** and add the same values from `.env.local`: `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, `GEMINI_MODEL`, `GCP_SERVICE_ACCOUNT_JSON`, and `APP_ACCESS_CODE`.
3. Keep the service-account JSON and access code as server-side values. Do not prefix them with `NEXT_PUBLIC_`.
4. Redeploy after adding or changing environment variables.
5. Open the deployment URL and test a short photo first, then a small multi-page PDF. Keep the access code private while this demo uses a service-account key.

The Next.js app can also be deployed to Netlify. Vercel is the documented first path here because it is the shortest Next.js deployment route; the application routes remain standard Next.js server routes.

## API flow

```text
Browser upload -> Next.js /api/analyze -> PDF pages rendered in memory
                                      -> Cloud Vision document OCR
                                      -> Vertex AI Gemini structured JSON
Browser follow-up -> /api/follow-up -> Vertex AI Gemini
Browser listen -> /api/speak -> Cloud Text-to-Speech -> MP3 audio
```

Uploaded files are not written to disk or Cloud Storage. The app does not retain analysis history; the current tab holds the result to support follow-up questions.

## GCP walkthrough references

- [Cloud Vision OCR](https://docs.cloud.google.com/vision/docs/ocr)
- [Cloud Vision PDF/TIFF processing](https://docs.cloud.google.com/vision/docs/pdf)
- [Vertex AI Gemini generateContent](https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/models/inference)
- [Vertex AI model lifecycle](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/model-versions)
- [Cloud Text-to-Speech languages and voices](https://docs.cloud.google.com/text-to-speech/docs/list-voices-and-types)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
