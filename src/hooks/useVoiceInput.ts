import { useCallback, useEffect, useRef, useState } from 'react';

type SR = typeof window extends { SpeechRecognition: infer T } ? T : any;

export function useVoiceInput(onResult: (text: string) => void, lang = 'en-US') {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = lang;
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
      onResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.abort(); } catch {} };
  }, [lang, onResult]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    try {
      recRef.current.start();
      setListening(true);
      if ('vibrate' in navigator) navigator.vibrate(40);
    } catch {}
  }, []);

  const stop = useCallback(() => {
    try { recRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  return { listening, supported, start, stop };
}

/**
 * Lightweight natural-language parser for voice task input.
 * Examples handled:
 *  - "Tomorrow 6 PM study DBMS"
 *  - "Today at 9am workout"
 *  - "Friday 14:30 meeting with team"
 */
export function parseVoiceTask(raw: string): { title: string; date?: string; time?: string } {
  let text = raw.trim();
  let date: string | undefined;
  let time: string | undefined;

  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  // Date keywords
  const lower = text.toLowerCase();
  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(now); d.setDate(d.getDate() + 1); date = fmt(d);
    text = text.replace(/\btomorrow\b/i, '').trim();
  } else if (/\btoday\b/.test(lower)) {
    date = fmt(now);
    text = text.replace(/\btoday\b/i, '').trim();
  } else {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    for (let i = 0; i < days.length; i++) {
      const re = new RegExp(`\\b${days[i]}\\b`, 'i');
      if (re.test(lower)) {
        const d = new Date(now);
        const diff = (i - d.getDay() + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        date = fmt(d);
        text = text.replace(re, '').trim();
        break;
      }
    }
  }

  // Time: 6pm, 6 pm, 6:30 pm, 14:30
  const tm = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (tm) {
    let h = parseInt(tm[1], 10);
    const m = tm[2] ? parseInt(tm[2], 10) : 0;
    const ampm = tm[3]?.toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      time = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      text = text.replace(tm[0], '').trim();
    }
  }

  // Cleanup connectors
  text = text.replace(/\b(at|on|by)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
  // Capitalize
  const title = text.charAt(0).toUpperCase() + text.slice(1);
  return { title: title || raw, date, time };
}
