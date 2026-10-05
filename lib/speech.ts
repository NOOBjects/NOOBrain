import { LANGUAGES_ON } from "./categories";
// Ler em voz alta com a voz do próprio aparelho (speechSynthesis): gratuito, sem chave e sem enviar nada para servidores nossos.
const LANGS: Record<string, string[]> = { pt: ["pt-PT", "pt"], en: ["en-GB", "en-US", "en"], es: ["es-ES", "es"], fr: ["fr-FR", "fr"], de: ["de-DE", "de"], it: ["it-IT", "it"] };

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

/** A melhor voz instalada para a língua (pt-PT antes de pt-BR, en-GB antes de en-US). */
function voiceFor(lang: string) {
  const voices = speechSynthesis.getVoices();
  for (const want of LANGS[lang] ?? [lang]) {
    const v = voices.find((x) => x.lang.replace("_", "-").toLowerCase() === want.toLowerCase()) ?? voices.find((x) => x.lang.toLowerCase().startsWith(want.toLowerCase()));
    if (v) return v;
  }
  return null;
}

/** Fala o texto; devolve uma promessa que acaba quando termina (ou é interrompido). */
export function speak(text: string, lang = "pt", rate = 1): Promise<void> {
  if (!canSpeak()) return Promise.resolve();
  speechSynthesis.cancel();
  return new Promise((done) => {
    const u = new SpeechSynthesisUtterance(text);
    const v = voiceFor(lang);
    if (v) u.voice = v;
    u.lang = v?.lang ?? (LANGS[lang]?.[0] ?? lang);
    u.rate = rate;
    u.onend = () => done();
    u.onerror = () => done();
    speechSynthesis.speak(u);
  });
}

export const stopSpeaking = () => { if (canSpeak()) speechSynthesis.cancel(); };

/** Língua estudada numa trilha (para a pronúncia nos cartões): por agora, deduzida do tema. */
export function trailLang(topic: string): string | null {
  if (!LANGUAGES_ON) return null; // línguas em pausa: sem pronúncia nos cartões
  const t = topic.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/\bingles\b|\benglish\b/.test(t)) return "en";
  if (/\bespanhol\b|\bcastelhano\b/.test(t)) return "es";
  if (/\bfrances\b/.test(t)) return "fr";
  if (/\balemao\b/.test(t)) return "de";
  if (/\bitaliano\b/.test(t)) return "it";
  return null;
}
