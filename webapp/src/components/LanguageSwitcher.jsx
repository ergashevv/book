import { useLang } from '../contexts/LangContext';

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useLang();

  return (
    <div className="lang-switcher" role="group" aria-label="Til">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`lang-switcher__btn ${lang === code ? 'lang-switcher__btn--active' : ''}`}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
