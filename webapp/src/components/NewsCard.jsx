import { useLang } from '../contexts/LangContext';

/**
 * titleKey, excerptKey, dateKey, tagKey
 */
export default function NewsCard({ titleKey, excerptKey, dateKey, tagKey }) {
  const { t } = useLang();
  return (
    <article className="news-card">
      <span className="news-card__tag">{t(tagKey)}</span>
      <h4 className="news-card__title">{t(titleKey)}</h4>
      <p className="news-card__excerpt">{t(excerptKey)}</p>
      <time className="news-card__date">{t(dateKey)}</time>
    </article>
  );
}
