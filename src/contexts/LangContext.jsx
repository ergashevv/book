import { createContext, useContext, useState, useEffect } from 'react';
import { LANG_KEY, LANGUAGES, getT } from '../i18n';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (LANGUAGES.some((l) => l.code === saved)) return saved;
    } catch (e) {}
    return 'uz';
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }, [lang]);

  const setLang = (code) => {
    if (LANGUAGES.some((l) => l.code === code)) setLangState(code);
  };

  const t = getT(lang);

  return (
    <LangContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
