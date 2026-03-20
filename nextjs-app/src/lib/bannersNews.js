/** Banner va yangiliklar – real rasmlar (Unsplash), keyinchalik API dan keladi */
const UNSPLASH = (id, w = 800) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&fit=crop`;

export const BANNERS = [
  {
    id: 1,
    type: 'hero',
    titleKey: 'banner.heroTitle',
    subKey: 'banner.heroSub',
    ctaKey: 'banner.ctaBooks',
    imageUrl: UNSPLASH('1497633762265-9d179a990aa6', 800), // kitoblar
    link: '/books',
  },
  {
    id: 2,
    type: 'promo',
    titleKey: 'banner.promoTitle',
    subKey: 'banner.promoSub',
    ctaKey: 'banner.ctaRead',
    imageUrl: UNSPLASH('1507003211169-0a1dd7228f2d', 800), // o'qish
    link: '/books',
  },
  {
    id: 3,
    type: 'news',
    titleKey: 'banner.newsTitle',
    subKey: 'banner.newsSub',
    ctaKey: 'banner.ctaMore',
    imageUrl: UNSPLASH('1512820790803-83ca734da794', 800), // kutubxona
    link: '/news',
  },
];

export const NEWS = [
  {
    id: 1,
    titleKey: 'news.item1Title',
    excerptKey: 'news.item1Excerpt',
    dateKey: 'news.item1Date',
    tagKey: 'news.tagNew',
  },
  {
    id: 2,
    titleKey: 'news.item2Title',
    excerptKey: 'news.item2Excerpt',
    dateKey: 'news.item2Date',
    tagKey: 'news.tagEvent',
  },
  {
    id: 3,
    titleKey: 'news.item3Title',
    excerptKey: 'news.item3Excerpt',
    dateKey: 'news.item3Date',
    tagKey: 'news.tagTip',
  },
  {
    id: 4,
    titleKey: 'news.item4Title',
    excerptKey: 'news.item4Excerpt',
    dateKey: 'news.item4Date',
    tagKey: 'news.tagUpdate',
  },
  {
    id: 5,
    titleKey: 'news.item5Title',
    excerptKey: 'news.item5Excerpt',
    dateKey: 'news.item5Date',
    tagKey: 'news.tagNew',
  },
];
