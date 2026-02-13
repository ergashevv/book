import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import Banner from '../components/Banner';
import NewsCard from '../components/NewsCard';
import { BANNERS, NEWS } from '../bannersNews';

export default function News() {
  const { t } = useLang();
  return (
    <div className="content">
      <section className="home-section">
        <h2 className="section-title">{t('news.title')}</h2>
        <p className="home-empty" style={{ marginBottom: 16 }}>{t('news.latest')}</p>
        {BANNERS.map((b) => (
          <Banner
            key={b.id}
            gradient={b.gradient}
            titleKey={b.titleKey}
            subKey={b.subKey}
            ctaKey={b.ctaKey}
            link={b.link}
            size={b.type === 'hero' ? 'lg' : 'md'}
          />
        ))}
      </section>

      <section className="home-section">
        <h3 className="news-section-title">{t('news.allNews')}</h3>
        {NEWS.map((item) => (
          <NewsCard
            key={item.id}
            titleKey={item.titleKey}
            excerptKey={item.excerptKey}
            dateKey={item.dateKey}
            tagKey={item.tagKey}
          />
        ))}
      </section>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link to="/books" className="btn">{t('home.booksLink')}</Link>
      </div>
    </div>
  );
}
