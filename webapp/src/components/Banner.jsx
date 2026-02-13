import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

/**
 * gradient, titleKey, subKey, ctaKey, link
 */
export default function Banner({ gradient, titleKey, subKey, ctaKey, link = '/books', size = 'md' }) {
  const { t } = useLang();
  const isLarge = size === 'lg';
  return (
    <Link to={link} className={`banner ${isLarge ? 'banner--lg' : 'banner--md'}`} style={{ background: gradient }}>
      <div className="banner__inner">
        <h3 className="banner__title">{t(titleKey)}</h3>
        {subKey && <p className="banner__sub">{t(subKey)}</p>}
        <span className="banner__cta">{t(ctaKey)} →</span>
      </div>
    </Link>
  );
}
