"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import type { Language } from "@/lib/prompt";

type Amount = { label: string; value: string; note: string; kind: string };
type Deadline = { date: string; what_happens_if_missed: string };
type Analysis = {
  doc_category: string; headline: string; doc_type: string; issuer: string; summary: string;
  amounts: Amount[]; deadlines: Deadline[]; red_flags: string[]; things_to_check: string[];
  actions: string[]; draft_reply: string; unclear_parts: string[];
};

const LANGUAGES: Array<{ id: Language; label: string; name: string }> = [
  { id: "mr", label: "मराठी", name: "Marathi" },
  { id: "hi", label: "हिंदी", name: "Hindi" },
  { id: "en", label: "English", name: "English" },
];

const copy = {
  mr: { eyebrow: "तुमच्या कागदाचा सोपा अर्थ", title: "कागद समजून घ्या. पुढचं पाऊल ठरवा.", intro: "बिल, बँकेचं पत्र किंवा विम्याचा कागद अपलोड करा. सोप्या भाषेत त्याचा अर्थ, महत्त्वाच्या तारखा आणि काय करायचं ते समजेल.", upload: "कागद इथे टाका किंवा निवडा", supported: "फोटो किंवा PDF · कमाल 3.8 MB · PDF मध्ये 8 पानांपर्यंत", tip: "फोटो स्पष्ट येण्यासाठी कागद सपाट ठेवा आणि चांगला उजेड ठेवा.", button: "कागद समजून घ्या", busy: "कागद वाचत आहोत…", summary: "सोप्या शब्दांत", money: "पैशांची माहिती", deadlines: "तारखा लक्षात ठेवा", flags: "लक्ष द्या", checks: "एकदा तपासा", actions: "आता काय करायचं", reply: "उत्तराचा मसुदा", unclear: "वाचता न आलेले भाग", ask: "या कागदाबद्दल प्रश्न विचारा", askPlaceholder: "उदा. ही तारीख चुकली तर काय होईल?", askButton: "विचारा", listen: "ऐकून घ्या", stop: "ऑडिओ थांबवा", copy: "मसुदा कॉपी करा", copied: "कॉपी झाला", reset: "दुसरा कागद पहा", disclaimer: "ही AI ने केलेली सोपी मांडणी आहे. महत्त्वाच्या गोष्टी जारी करणाऱ्या कार्यालयाकडून तपासून घ्या.", privacy: "तुमची फाइल या अॅपमध्ये सेव्ह होत नाही. OCR, समजावणी आणि आवाजासाठी ती Google Cloud कडे पाठवली जाते.", accessTitle: "तुमचा KaagazSathi", accessText: "अॅप उघडण्यासाठी तुमचा प्रवेश कोड टाका.", access: "प्रवेश कोड", enter: "अॅप उघडा", problem: "काहीतरी चुकलं. पुन्हा प्रयत्न करा.", noData: "इथे वाचण्यासारखी माहिती नाही.", amountKind: { received: "मिळणारी रक्कम", due: "भरायची रक्कम", info: "माहिती", calculation: "हिशोबासाठी" } },
  hi: { eyebrow: "आपके कागज़ का आसान मतलब", title: "कागज़ समझें। अगला कदम तय करें।", intro: "बिल, बैंक का पत्र या बीमा का कागज़ अपलोड करें। आसान भाषा में उसका मतलब, ज़रूरी तारीखें और आगे क्या करना है, समझें।", upload: "कागज़ यहाँ छोड़ें या चुनें", supported: "फ़ोटो या PDF · अधिकतम 3.8 MB · PDF में 8 पन्नों तक", tip: "साफ़ फ़ोटो के लिए कागज़ सपाट रखें और अच्छी रोशनी में तस्वीर लें।", button: "कागज़ समझें", busy: "कागज़ पढ़ा जा रहा है…", summary: "आसान शब्दों में", money: "पैसों की जानकारी", deadlines: "तारीख़ें याद रखें", flags: "ध्यान दें", checks: "एक बार जाँचें", actions: "अब क्या करें", reply: "जवाब का मसौदा", unclear: "जो हिस्से पढ़े नहीं जा सके", ask: "इस कागज़ के बारे में सवाल पूछें", askPlaceholder: "जैसे: यह तारीख़ निकल जाए तो क्या होगा?", askButton: "पूछें", listen: "सुनें", stop: "ऑडियो रोकें", copy: "मसौदा कॉपी करें", copied: "कॉपी हो गया", reset: "दूसरा कागज़ देखें", disclaimer: "यह AI की आसान व्याख्या है। ज़रूरी बात जारी करने वाले कार्यालय से जाँच लें।", privacy: "आपकी फ़ाइल इस ऐप में सेव नहीं होती। OCR, समझने और आवाज़ बनाने के लिए इसे Google Cloud को भेजा जाता है।", accessTitle: "आपका KaagazSathi", accessText: "ऐप खोलने के लिए अपना एक्सेस कोड डालें।", access: "एक्सेस कोड", enter: "ऐप खोलें", problem: "कुछ गड़बड़ हुई। फिर से कोशिश करें।", noData: "पढ़ने लायक जानकारी नहीं मिली।", amountKind: { received: "मिलने वाली राशि", due: "देय राशि", info: "जानकारी", calculation: "हिसाब के लिए" } },
  en: { eyebrow: "A clearer read of your paperwork", title: "Understand the paper. Know what to do next.", intro: "Upload a bill, bank letter, insurance paper, or notice. Get a plain explanation, important dates, and practical next steps.", upload: "Drop a document here or choose a file", supported: "Photo or PDF · up to 3.8 MB · PDFs up to 8 pages", tip: "For a clearer read, lay the paper flat and use good light.", button: "Explain this document", busy: "Reading your document…", summary: "In plain words", money: "Money details", deadlines: "Dates to remember", flags: "Pay attention", checks: "Worth checking", actions: "What to do next", reply: "Draft reply", unclear: "Hard to read", ask: "Ask about this document", askPlaceholder: "For example: What happens if I miss this date?", askButton: "Ask", listen: "Listen", stop: "Stop audio", copy: "Copy draft", copied: "Copied", reset: "Choose another document", disclaimer: "This is an AI explanation. Confirm important details with the office that issued the document.", privacy: "Your file is not saved by this app. It is sent to Google Cloud for OCR, explanation, and speech.", accessTitle: "Your KaagazSathi", accessText: "Enter your access code to open the app.", access: "Access code", enter: "Open app", problem: "Something went wrong. Please try again.", noData: "No readable information was found.", amountKind: { received: "Money received", due: "Money due", info: "Information", calculation: "Calculation" } },
};

function Icon({ name }: { name: "leaf" | "upload" | "doc" | "arrow" | "clock" | "coins" | "check" | "alert" | "speaker" | "copy" | "lock" | "sparkle" }) {
  const paths: Record<string, ReactNode> = {
    leaf: <><path d="M20.4 3.6C12.8 3.6 5.1 5.3 4 11.2c-.6 3.4 1.6 5.8 4.5 5.8 5.6 0 11-6.6 11.9-13.4Z"/><path d="M3.5 21c2.1-5.1 6.2-8.6 11.8-10.4"/></>,
    upload: <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v4h16v-4"/></>,
    doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    coins: <><circle cx="8" cy="8" r="5"/><path d="M3 8v4a5 5 0 0 0 9.6 2M13 16a5 5 0 1 0 4-8"/><path d="M8 6v4M6.5 7h3M16 14v4M14.5 15h3"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    alert: <><path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v4M12 17h.01"/></>,
    speaker: <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a5 5 0 0 1 0 6M18 6a9 9 0 0 1 0 12"/></>,
    copy: <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3"/></>,
    sparkle: <><path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

async function readJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export default function KaagazSathiApp() {
  const [language, setLanguage] = useState<Language>("mr");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [accessCode, setAccessCode] = useState("");
  const [hasAccess, setHasAccess] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const t = copy[language];

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("kaagazsathi-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("kaagazsathi-theme", theme);
  }, [theme]);

  function themeButton() {
    const label = theme === "light"
      ? language === "mr" ? "डार्क मोड" : language === "hi" ? "डार्क मोड" : "Dark mode"
      : language === "mr" ? "लाईट मोड" : language === "hi" ? "लाइट मोड" : "Light mode";
    return <button className="secondary-button theme-button" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={label} title={label}>
      <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span><span className="theme-button-label">{label}</span>
    </button>;
  }

  function languageSelector() {
    return <nav className="language-switch" aria-label="Choose language">{LANGUAGES.map((item) => <button key={item.id} className={language === item.id ? "selected" : ""} onClick={() => { setLanguage(item.id); if (analysis) { setAnalysis(null); setAnswer(""); setAudioUrl(""); setQuestion(""); } }} aria-pressed={language === item.id}>{item.label}</button>)}</nav>;
  }

  function chooseFile(next: File | null) {
    setError(""); setAnalysis(null); setOcrText(""); setAnswer(""); setQuestion(""); setAudioUrl("");
    if (next) setFile(next);
  }

  async function enterApp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    try {
      await readJson(await fetch("/api/access", { method: "POST", headers: { "x-app-access-code": accessCode } }));
      setHasAccess(true);
    } catch (caught) { setError(caught instanceof Error ? caught.message : t.problem); }
  }

  async function analyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    setBusy(true); setError(""); setAnalysis(null); setAnswer(""); setAudioUrl("");
    try {
      const form = new FormData(); form.set("file", file); form.set("language", language);
      const response = await fetch("/api/analyze", { method: "POST", headers: { "x-app-access-code": accessCode }, body: form });
      const data = await readJson(response);
      setAnalysis(data.result); setOcrText(data.ocrText || "");
    } catch (caught) { setError(caught instanceof Error ? caught.message : t.problem); }
    finally { setBusy(false); }
  }

  async function copyDraft() {
    if (!analysis?.draft_reply) return;
    try { await navigator.clipboard.writeText(analysis.draft_reply); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setError(language === "mr" ? "कॉपी करता आलं नाही. मसुदा निवडून कॉपी करा." : language === "hi" ? "कॉपी नहीं हुआ। मसौदा चुनकर कॉपी करें।" : "Could not copy. Select and copy the draft manually."); }
  }

  async function askQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!question.trim() || !ocrText) return;
    setAsking(true); setError(""); setAnswer("");
    try {
      const response = await fetch("/api/follow-up", { method: "POST", headers: { "Content-Type": "application/json", "x-app-access-code": accessCode }, body: JSON.stringify({ documentText: ocrText, question, language, docCategory: analysis?.doc_category }) });
      const data = await readJson(response); setAnswer(data.answer); setQuestion("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : t.problem); }
    finally { setAsking(false); }
  }

  async function listen() {
    if (!analysis) return;
    if (speaking && audioRef.current) { audioRef.current.pause(); setSpeaking(false); return; }
    const speechText = [analysis.headline, analysis.summary, ...analysis.deadlines.map((item) => `${item.date}. ${item.what_happens_if_missed}`), ...analysis.actions].filter(Boolean).join(". ");
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/speak", { method: "POST", headers: { "Content-Type": "application/json", "x-app-access-code": accessCode }, body: JSON.stringify({ text: speechText, language }) });
      const data = await readJson(response); const src = `data:audio/mpeg;base64,${data.audio}`;
      setAudioUrl(src); window.setTimeout(() => { if (audioRef.current) { audioRef.current.play(); setSpeaking(true); } }, 50);
    } catch (caught) { setError(caught instanceof Error ? caught.message : t.problem); }
    finally { setBusy(false); }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files?.[0] || null); }
  function handleInput(event: ChangeEvent<HTMLInputElement>) { chooseFile(event.target.files?.[0] || null); event.target.value = ""; }
  function startOver() { setFile(null); setAnalysis(null); setOcrText(""); setQuestion(""); setAnswer(""); setError(""); setAudioUrl(""); }

  function logOut() {
    audioRef.current?.pause();
    setSpeaking(false);
    setAccessCode("");
    setHasAccess(false);
    startOver();
  }

  if (!hasAccess) return <main className="gate-shell" data-theme={theme}><div className="gate-controls">{languageSelector()}{themeButton()}</div><section className="gate-card"><div className="brand-mark"><Icon name="leaf" /></div><p className="eyebrow">KAAGAZSATHI</p><h1>{t.accessTitle}</h1><p>{t.accessText}</p><form onSubmit={enterApp} className="access-form"><label htmlFor="access-code">{t.access}</label><input id="access-code" type="password" autoComplete="current-password" value={accessCode} onChange={(event) => setAccessCode(event.target.value)} required /><button className="primary-button" type="submit"><Icon name="lock" />{t.enter}</button></form>{error && <p className="error-message" role="alert">{error}</p>}<p className="tiny-note">Private access helps protect your Google Cloud usage.</p></section></main>;

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="KaagazSathi home"><span className="brand-mark"><Icon name="leaf" /></span><span><strong>कागज़ साथी</strong><small>KAAGAZSATHI</small></span></a><div className="header-controls">{languageSelector()}{themeButton()}<button className="secondary-button logout-button" type="button" onClick={logOut}>{language === "mr" ? "बाहेर पडा" : language === "hi" ? "लॉग आउट" : "Log out"}</button></div></header>

    <section className="hero" id="top"><div className="hero-copy"><span className="eyebrow"><Icon name="sparkle" />{t.eyebrow}</span><h1>{t.title}</h1><p>{t.intro}</p></div><div className="hero-doodle" aria-hidden="true"><div className="doodle-paper"><span/><span/><span/><i><Icon name="check" /></i></div><div className="doodle-stem"/><div className="doodle-leaf leaf-one"/><div className="doodle-leaf leaf-two"/></div></section>

    {!analysis ? <section className="workspace"><form className="upload-card" onSubmit={analyze}>
      <div className="section-heading"><span className="step-number">01</span><div><h2>{language === "mr" ? "कागद निवडा" : language === "hi" ? "कागज़ चुनें" : "Choose a document"}</h2><p>{language === "mr" ? "फोटो किंवा PDF मधून सुरुवात करा." : language === "hi" ? "फ़ोटो या PDF से शुरू करें।" : "Start with a photo or PDF."}</p></div></div>
      <div className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => fileInput.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") fileInput.current?.click(); }}>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.pdf" onChange={handleInput} hidden />
        {file ? <><div className="upload-icon file-icon"><Icon name="doc" /></div><strong className="filename">{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB</span><button className="text-button" type="button" onClick={(event) => { event.stopPropagation(); startOver(); }}>{language === "mr" ? "फाइल काढा" : language === "hi" ? "फ़ाइल हटाएँ" : "Remove file"}</button></> : <><div className="upload-icon"><Icon name="upload" /></div><strong>{t.upload}</strong><span>{t.supported}</span></>}
      </div>
      <div className="upload-tip"><span>✦</span>{t.tip}</div>
      <div className="privacy-line"><Icon name="lock" /><span>{t.privacy}</span></div>
      <button className="primary-button analyze-button" type="submit" disabled={!file || busy}>{busy ? <><span className="spinner" />{t.busy}</> : <><Icon name="sparkle" />{t.button}<Icon name="arrow" /></>}</button>
    </form><aside className="side-note"><div className="note-icon"><Icon name="leaf" /></div><h3>{language === "mr" ? "अंदाज नको, स्पष्टता हवी." : language === "hi" ? "अंदाज़ा नहीं, साफ़ समझ." : "Clarity, without the guesswork."}</h3><p>{language === "mr" ? "आकडा किंवा तारीख नीट वाचता आली नाही, तर आम्ही ते स्पष्ट सांगू." : language === "hi" ? "कोई रकम या तारीख साफ़ न दिखे, तो हम बता देंगे।" : "If a number or date is hard to read, the explanation will say so."}</p><div className="note-rule"/><p className="note-quote">“{language === "mr" ? "मला आता हा कागद कळला." : language === "hi" ? "अब मुझे यह कागज़ समझ आया।" : "Now I understand this paper."}”</p><small>{language === "mr" ? "हेच आमचं ध्येय." : language === "hi" ? "यही हमारा मक़सद है।" : "That is the point."}</small></aside></section> : <section className="results-section">
      <div className="result-toolbar"><div><span className="eyebrow"><span className="status-dot"/> {language === "mr" ? "कागद समजावून झाला" : language === "hi" ? "कागज़ समझाया गया" : "DOCUMENT EXPLAINED"}</span><h2>{analysis.doc_type || t.summary}</h2><p>{analysis.issuer}</p></div><div className="toolbar-actions"><button className="secondary-button" type="button" onClick={listen} disabled={busy}><Icon name="speaker" />{speaking ? t.stop : t.listen}</button><button className="secondary-button" type="button" onClick={startOver}>{t.reset}</button></div></div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setSpeaking(false)} onPause={() => setSpeaking(false)} className="audio-player" controls />}
      <div className="headline-card"><div className="headline-icon"><Icon name="sparkle" /></div><p>{analysis.headline}</p></div>
      <div className="results-grid">
        <article className="result-card summary-card"><CardTitle icon="doc" title={t.summary} /><p className="summary-text">{analysis.summary}</p></article>
        <article className="result-card"><CardTitle icon="coins" title={t.money} />{analysis.amounts.length ? <div className="amount-list">{analysis.amounts.map((amount, index) => <div className="amount-row" key={`${amount.label}-${index}`}><div className="amount-top"><span>{amount.label}</span><span className={`amount-kind kind-${amount.kind}`}>{t.amountKind[amount.kind as keyof typeof t.amountKind] || t.amountKind.info}</span></div><strong>{amount.value}</strong>{amount.note && <small>{amount.note}</small>}</div>)}</div> : <Empty text={t.noData}/>}</article>
        <article className="result-card deadline-card"><CardTitle icon="clock" title={t.deadlines} />{analysis.deadlines.length ? <div className="timeline-list">{analysis.deadlines.map((item, index) => <div className="timeline-item" key={`${item.date}-${index}`}><strong>{item.date}</strong><p>{item.what_happens_if_missed}</p></div>)}</div> : <Empty text={t.noData}/>}</article>
        {analysis.red_flags.length > 0 && <article className="result-card flag-card"><CardTitle icon="alert" title={t.flags} />{analysis.red_flags.map((item, index) => <div className="flag-item" key={index}><span className="flag-mark">!</span><p>{item}</p></div>)}</article>}
        {analysis.actions.length > 0 && <article className="result-card action-card"><CardTitle icon="check" title={t.actions} /><ol className="action-list">{analysis.actions.map((item, index) => <li key={index}><span>{index + 1}</span><p>{item}</p></li>)}</ol></article>}
        {analysis.things_to_check.length > 0 && <article className="result-card"><CardTitle icon="check" title={t.checks} /><ul className="plain-list">{analysis.things_to_check.map((item, index) => <li key={index}>{item}</li>)}</ul></article>}
        {analysis.draft_reply && <article className="result-card reply-card"><CardTitle icon="doc" title={t.reply} /><p className="reply-text">{analysis.draft_reply}</p><button className="copy-button" type="button" onClick={copyDraft}><Icon name="copy" />{copied ? t.copied : t.copy}</button></article>}
        {analysis.unclear_parts.length > 0 && <article className="result-card unclear-card"><CardTitle icon="alert" title={t.unclear} /><ul className="plain-list">{analysis.unclear_parts.map((item, index) => <li key={index}>{item}</li>)}</ul></article>}
      </div>
      <section className="followup-card"><div className="followup-heading"><span className="followup-icon"><Icon name="sparkle" /></span><div><h3>{t.ask}</h3><p>{language === "mr" ? "उत्तर फक्त या कागदातल्या माहितीवर आधारित असेल." : language === "hi" ? "जवाब इसी कागज़ की जानकारी पर आधारित होगा।" : "Answers use information from this document only."}</p></div></div><form className="question-form" onSubmit={askQuestion}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t.askPlaceholder} maxLength={1000} /><button className="primary-button" type="submit" disabled={asking || !question.trim()}>{asking ? <span className="spinner"/> : t.askButton}<Icon name="arrow" /></button></form>{answer && <div className="answer-box"><strong>{language === "mr" ? "उत्तर" : language === "hi" ? "जवाब" : "Answer"}</strong><p>{answer}</p></div>}</section>
      <details className="source-details"><summary>{language === "mr" ? "वाचलेला मजकूर पाहा" : language === "hi" ? "पढ़ा गया टेक्स्ट देखें" : "View extracted text"}</summary><pre>{ocrText}</pre></details>
      <p className="result-disclaimer">{t.disclaimer}</p>
    </section>}
    {error && <div className="toast-error" role="alert"><Icon name="alert" />{error}<button type="button" aria-label="Dismiss" onClick={() => setError("")}>×</button></div>}
    <footer className="footer"><span>कागज़ साथी <span>·</span> Made for clearer conversations</span><span>{language === "mr" ? "काहीही सेव्ह नाही" : language === "hi" ? "कुछ सेव नहीं होता" : "Nothing saved by this app"}</span></footer>
  </main>;
}

function CardTitle({ icon, title }: { icon: "doc" | "coins" | "clock" | "alert" | "check"; title: string }) { return <div className="card-title"><span><Icon name={icon} /></span><h3>{title}</h3></div>; }
function Empty({ text }: { text: string }) { return <p className="empty-state">{text}</p>; }
