export const LANG_KEY = 'app_lang';
export const LANGUAGES = [
  { code: 'uz', label: 'Oʻzbek' },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
];

const translations = {
  uz: {
    app: { loading: 'Yuklanmoqda...', telegramOnly: 'Bu ilova faqat Telegram orqali ishlatiladi. Bot orqali kirishingiz kerak.' },
    nav: { home: 'Bosh sahifa', books: 'Kitoblar', profile: 'Profil', aria: 'Asosiy menyu' },
    home: {
      welcomeHint: 'Kategoriyani tanlang yoki',
      booksLink: 'Kitoblar',
      welcomeHint2: 'bo‘limida barcha kitoblarni ko‘ring.',
      categories: 'Kategoriyalar',
      loading: 'Yuklanmoqda...',
      error: 'Xatolik',
      noCategories: 'Hali kategoriya yoʻq. Admin paneldan qoʻshing.',
      authError: 'Kirish tasdiqlanmadi. Botda «Kitobxonga o\'tish» tugmasini qayta bosing.',
    },
    books: {
      title: 'Kitoblar',
      all: 'Barchasi',
      loading: 'Yuklanmoqda...',
      error: 'Xatolik',
      noBooks: 'Bu boʻlimda hali kitob yoʻq.',
      pages: 'sahifa',
    },
    profile: {
      title: 'Profil',
      login: 'Kirish',
      loginDesc: 'Telegram orqali tasdiqlandi. Maʼlumotlaringiz faqat kitob progressini saqlash uchun ishlatiladi.',
      devMode: 'Dev rejim (lokal test)',
      app: 'Ilova',
      appDesc: '📚 Kitobxona – PDF kitoblarni o‘qish. Kategoriyalar va kitoblar bosh sahifada va Kitoblar bo‘limida.',
      toHome: 'Bosh sahifaga →',
    },
    reader: {
      exit: '← Chiqish',
      back: '← Orqaga',
      zoomOut: 'Kichiklashtirish',
      zoomIn: 'Kattalashtirish',
      sepia: 'Sepia',
      light: 'Oq',
      dark: 'Qora',
      prevPage: '← Oldingi',
      nextPage: 'Keyingi →',
      bookLoading: 'Kitob yuklanmoqda...',
      pdfJsError: 'PDF.js yuklanmadi. Internetingizni tekshiring.',
      pdfError: 'PDF yuklanmadi',
      pageAria: 'Sahifa: chap/o‘ng bosing, suring yoki markazda bosing – panel yashirish',
    },
  },
  ru: {
    app: { loading: 'Загрузка...', telegramOnly: 'Это приложение работает только через Telegram. Войдите через бота.' },
    nav: { home: 'Главная', books: 'Книги', profile: 'Профиль', aria: 'Главное меню' },
    home: {
      welcomeHint: 'Выберите категорию или',
      booksLink: 'Книги',
      welcomeHint2: 'чтобы увидеть все книги.',
      categories: 'Категории',
      loading: 'Загрузка...',
      error: 'Ошибка',
      noCategories: 'Пока нет категорий. Добавьте в админ-панели.',
      authError: 'Вход не подтверждён. Нажмите «Перейти в библиотеку» в боте снова.',
    },
    books: {
      title: 'Книги',
      all: 'Все',
      loading: 'Загрузка...',
      error: 'Ошибка',
      noBooks: 'В этом разделе пока нет книг.',
      pages: 'стр.',
    },
    profile: {
      title: 'Профиль',
      login: 'Вход',
      loginDesc: 'Подтверждено через Telegram. Ваши данные используются только для сохранения прогресса чтения.',
      devMode: 'Режим разработки (локальный тест)',
      app: 'Приложение',
      appDesc: '📚 Библиотека – чтение PDF. Категории и книги на главной и в разделе «Книги».',
      toHome: 'На главную →',
    },
    reader: {
      exit: '← Выход',
      back: '← Назад',
      zoomOut: 'Уменьшить',
      zoomIn: 'Увеличить',
      sepia: 'Сепия',
      light: 'Светлая',
      dark: 'Тёмная',
      prevPage: '← Назад',
      nextPage: 'Вперёд →',
      bookLoading: 'Загрузка книги...',
      pdfJsError: 'PDF.js не загрузился. Проверьте интернет.',
      pdfError: 'PDF не загружен',
      pageAria: 'Страница: нажмите влево/вправо, свайп или по центру – скрыть панель',
    },
  },
  en: {
    app: { loading: 'Loading...', telegramOnly: 'This app only works via Telegram. Please open it from the bot.' },
    nav: { home: 'Home', books: 'Books', profile: 'Profile', aria: 'Main menu' },
    home: {
      welcomeHint: 'Choose a category or open',
      booksLink: 'Books',
      welcomeHint2: 'to see all books.',
      categories: 'Categories',
      loading: 'Loading...',
      error: 'Error',
      noCategories: 'No categories yet. Add them in the admin panel.',
      authError: 'Sign-in not verified. Tap «Go to library» in the bot again.',
    },
    books: {
      title: 'Books',
      all: 'All',
      loading: 'Loading...',
      error: 'Error',
      noBooks: 'No books in this section yet.',
      pages: 'p.',
    },
    profile: {
      title: 'Profile',
      login: 'Sign in',
      loginDesc: 'Verified via Telegram. Your data is only used to save reading progress.',
      devMode: 'Dev mode (local test)',
      app: 'App',
      appDesc: '📚 Library – read PDF books. Categories and books on Home and in Books.',
      toHome: 'To Home →',
    },
    reader: {
      exit: '← Exit',
      back: '← Back',
      zoomOut: 'Zoom out',
      zoomIn: 'Zoom in',
      sepia: 'Sepia',
      light: 'Light',
      dark: 'Dark',
      prevPage: '← Prev',
      nextPage: 'Next →',
      bookLoading: 'Loading book...',
      pdfJsError: 'PDF.js failed to load. Check your connection.',
      pdfError: 'PDF failed to load',
      pageAria: 'Page: tap left/right, swipe, or center to toggle panel',
    },
  },
};

export function getT(lang) {
  const dict = translations[lang] || translations.uz;
  return (key) => {
    const parts = key.split('.');
    let v = dict;
    for (const p of parts) {
      v = v?.[p];
      if (v === undefined) return key;
    }
    return typeof v === 'string' ? v : key;
  };
}
