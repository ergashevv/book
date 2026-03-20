import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';

/**
 * imageUrl (real rasm) yoki gradient, titleKey, subKey, ctaKey, link
 */
export default function Banner({ imageUrl, gradient, titleKey, subKey, ctaKey, link = '/books', size = 'md' }) {
  const { t } = useLang();
  const isLarge = size === 'lg';
  const style = imageUrl
    ? { backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 50%, transparent 100%), url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: gradient || 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)' };

  return (
    <Link to={link} className={`banner ${isLarge ? 'banner--lg' : 'banner--md'}`} style={style}>
      <div className="banner__inner">
        <h3 className="banner__title">{t(titleKey)}</h3>
        {subKey && <p className="banner__sub">{t(subKey)}</p>}
        <span className="banner__cta">{t(ctaKey)} →</span>
      </div>
    </Link>
  );
}
