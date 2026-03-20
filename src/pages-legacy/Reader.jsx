import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { apiGet, apiPost, fetchBookFile, translateText, getBookCoverUrl } from '../api';
import { useLang } from '../contexts/LangContext';
import { useReading } from '../contexts/ReadingContext';
import { IconArrowLeft, IconMoreVertical, IconZoomOut, IconZoomIn, IconChevronLeft, IconChevronRight } from '../components/Icons';
import Spinner from '../components/Spinner';

const TRANSLATION_CACHE_MAX = 50;
const TRANSLATE_DEBOUNCE_MS = 400;

const pdfjsLib = typeof window !== 'undefined' ? window.pdfjsLib : null;
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const PROGRESS_DEBOUNCE_MS = 600;
const UI_AUTO_HIDE_MS = 3000;
const AVG_WORDS_PER_MIN = 200;

export default function Reader({ initData }) {
  const { t, lang } = useLang();
  const { updateProgress: updateReadingProgress } = useReading();
  const THEMES = [
    { id: 'sepia', labelKey: 'reader.sepia' },
    { id: 'light', labelKey: 'reader.light' },
    { id: 'dark', labelKey: 'reader.dark' },
    { id: 'amoled', labelKey: 'reader.amoled' },
  ];
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [bookLoading, setBookLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage === 'undefined') return 'sepia';
    return localStorage.getItem('readerTheme') || 'sepia';
  });
  const [zoomIndex, setZoomIndex] = useState(() => {
    if (typeof localStorage === 'undefined') return 1;
    const s = localStorage.getItem('readerZoom');
    const i = parseInt(s, 10);
    return Number.isFinite(i) && i >= 0 && i < ZOOM_LEVELS.length ? i : 1;
  });
  const [fitWidth, setFitWidth] = useState(false);
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const containerRef = useRef(null);
  const [uiVisible, setUiVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showTranslate, setShowTranslate] = useState(false);
  const [translateMode, setTranslateMode] = useState('page'); // 'page' | 'custom'
  const [customText, setCustomText] = useState('');
  const [translated, setTranslated] = useState('');
  const [translateLoading, setTranslateLoading] = useState(false);
  const [translateError, setTranslateError] = useState(null);
  const translateCache = useRef(new Map());
  const touchStartX = useRef(0);
  const didSwipe = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchIndex, setSearchIndex] = useState(-1);
  const [searchLoading, setSearchLoading] = useState(false);

  const [fitPage, setFitPage] = useState(() => typeof localStorage !== 'undefined' ? localStorage.getItem('readerFitPage') === 'true' : false);
  const scale = fitWidth ? null : fitPage ? null : ZOOM_LEVELS[zoomIndex];

  // Toggle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide UI after 3s inactivity
  const hideTimerRef = useRef(null);
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!uiVisible) return;
    hideTimerRef.current = setTimeout(() => setUiVisible(false), UI_AUTO_HIDE_MS);
  }, [uiVisible]);

  useEffect(() => {
    if (!uiVisible) return;
    resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [uiVisible, currentPage, theme, zoomIndex, resetHideTimer]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('readerTheme', theme);
  }, [theme]);
  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('readerZoom', String(zoomIndex));
  }, [zoomIndex]);
  useEffect(() => {
    if (typeof localStorage !== 'undefined') localStorage.setItem('readerFitPage', String(fitPage));
  }, [fitPage]);

  // Load book metadata and progress (progress failure = default to page 1)
  useEffect(() => {
    if (!bookId) return;
    setBookLoading(true);
    setError(null);
    apiGet(`/books/${bookId}`, initData)
      .then((b) => {
        setBook(b);
        return apiGet(`/books/${bookId}/progress`, initData).catch(() => ({ page_number: 1 }));
      })
      .then((p) => {
        const num = p?.page_number;
        const page = typeof num === 'number' && num >= 1 ? Math.floor(num) : 1;
        setCurrentPage(page);
        setPageInput(String(page));
      })
      .catch((e) => setError(e?.message || 'Failed to load book'))
      .finally(() => setBookLoading(false));
  }, [bookId, initData]);

  useEffect(() => {
    if (book) document.title = `${book.title || 'Book'} · Sphere`;
    return () => { document.title = 'Sphere'; };
  }, [book]);

  // Load PDF file
  const loadPdf = useCallback(() => {
    if (!bookId || !book) return;
    setPdfLoading(true);
    setError(null);
    fetchBookFile(bookId, initData)
      .then((arrayBuffer) => {
        if (!pdfjsLib) {
          setError(t('reader.pdfJsError'));
          setPdfLoading(false);
          return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      })
      .then((doc) => {
        if (doc) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
        }
        setPdfLoading(false);
      })
      .catch((e) => {
        setError(e?.message || t('reader.pdfError'));
        setPdfLoading(false);
      });
  }, [bookId, book, initData, t]);

  useEffect(() => {
    if (!bookId || !book) return;
    loadPdf();
  }, [bookId, book, loadPdf]);

  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const container = containerRef.current;
      const baseViewport = page.getViewport({ scale: 1 });
      const baseWidth = baseViewport.width;
      const baseHeight = baseViewport.height;
      const maxWidth = Math.max(1, container.clientWidth - 16);
      const maxHeight = Math.max(1, container.clientHeight - 16);
      const dpr = Math.min(2, window.devicePixelRatio || 2);
      let scaleLogical;
      if (fitWidth) scaleLogical = maxWidth / baseWidth;
      else if (fitPage) scaleLogical = Math.min(maxWidth / baseWidth, maxHeight / baseHeight);
      else scaleLogical = Math.min((maxWidth / baseWidth) * (scale ?? 1), 3);
      const scaleRender = scaleLogical * dpr;
      const viewport = page.getViewport({ scale: scaleRender });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = viewport.width / dpr + 'px';
      canvas.style.height = viewport.height / dpr + 'px';

      // Clear previous text layer
      if (textLayerRef.current) {
        textLayerRef.current.innerHTML = '';
        textLayerRef.current.style.width = canvas.style.width;
        textLayerRef.current.style.height = canvas.style.height;
      }

      await page.render({ canvasContext: ctx, viewport }).promise;

      // Render Text Layer for selection
      if (textLayerRef.current) {
        const textContent = await page.getTextContent();
        pdfjsLib.renderTextLayer({
          textContent,
          container: textLayerRef.current,
          viewport: page.getViewport({ scale: scaleLogical }),
          enhanceTextSelection: true,
        });
      }
    },
    [pdfDoc, scale, fitWidth, fitPage]
  );

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    if (currentPage >= 1 && currentPage <= totalPages) renderPage(currentPage);
  }, [currentPage, totalPages, renderPage]);

  // Debounced progress save (API + local for Continue Reading)
  useEffect(() => {
    if (!bookId || currentPage < 1 || totalPages < 1) return;
    const id = setTimeout(() => {
      apiPost(`/books/${bookId}/progress`, { page_number: currentPage }, initData).catch(() => {});
      updateReadingProgress(bookId, {
        page: currentPage,
        totalPages,
        title: book?.title ?? '',
        coverUrl: book ? getBookCoverUrl(book, initData) : null,
      });
    }, PROGRESS_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [bookId, currentPage, totalPages, initData, book, updateReadingProgress]);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const goToPage = (page) => {
    const num = parseInt(page, 10);
    if (Number.isFinite(num) && num >= 1 && num <= totalPages) {
      setCurrentPage(num);
      setPageInput(String(num));
    } else {
      setPageInput(String(currentPage));
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    goToPage(pageInput.trim());
  };

  const handleTap = (e) => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const w = rect.width;
    if (!uiVisible) {
      setUiVisible(true);
      setMenuOpen(false);
      return;
    }
    if (x < w * 0.25) goPrev();
    else if (x > w * 0.75) goNext();
    else {
      setUiVisible(false);
      setMenuOpen(false);
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? 0;
    didSwipe.current = false;
  };
  const handleTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? 0;
    const delta = touchStartX.current - endX;
    if (Math.abs(delta) > 50) {
      didSwipe.current = true;
      if (delta > 0) goNext();
      else goPrev();
    }
  };

  const progressPct = totalPages ? (currentPage / totalPages) * 100 : 0;
  const pagesLeft = totalPages ? Math.max(0, totalPages - currentPage) : 0;
  const minsLeft = pagesLeft > 0 ? Math.max(1, Math.round(pagesLeft * 0.8)) : 0;
  const loading = bookLoading || (pdfLoading && !pdfDoc);

  const getPageText = useCallback(async () => {
    if (!pdfDoc || currentPage < 1 || currentPage > totalPages) return '';
    const page = await pdfDoc.getPage(currentPage);
    const content = await page.getTextContent();
    return content.items.map((item) => item.str).join(' ').trim();
  }, [pdfDoc, currentPage, totalPages]);

  const runTranslate = useCallback(
    async (textToTranslate) => {
      if (!textToTranslate.trim()) {
        setTranslated('');
        setTranslateError(null);
        return;
      }
      const key = `${textToTranslate.slice(0, 200)}-${lang}`;
      if (translateCache.current.has(key)) {
        setTranslated(translateCache.current.get(key));
        setTranslateError(null);
        return;
      }
      setTranslateLoading(true);
      setTranslateError(null);
      const { translated: result, error } = await translateText(textToTranslate, lang, initData);
      setTranslateLoading(false);
      if (error) {
        setTranslateError(error);
        setTranslated('');
      } else {
        setTranslated(result);
        const cache = translateCache.current;
        if (cache.size >= TRANSLATION_CACHE_MAX) {
          const first = cache.keys().next().value;
          if (first) cache.delete(first);
        }
        cache.set(key, result);
      }
    },
    [lang, initData]
  );

  const handleTranslatePage = useCallback(() => {
    getPageText().then((text) => {
      if (text) runTranslate(text);
      else setTranslateError('No text on this page.');
    });
  }, [getPageText, runTranslate]);

  const handleCopyTranslation = useCallback(() => {
    if (translated && navigator.clipboard) navigator.clipboard.writeText(translated);
  }, [translated]);

  const didTranslateOnOpen = useRef(false);
  useEffect(() => {
    if (!showTranslate) {
      didTranslateOnOpen.current = false;
      return;
    }
    setTranslated('');
    setTranslateError(null);
    if (translateMode === 'page' && !didTranslateOnOpen.current) {
      didTranslateOnOpen.current = true;
      handleTranslatePage();
    }
  }, [showTranslate, translateMode]);

  if (bookLoading && !book) {
    return (
      <div className="reader-wrap reader-wrap--loading" data-theme="sepia">
        <div className="reader-loading">
          <Spinner size="lg" />
          <p className="reader-loading__text">{t('reader.bookLoading')}</p>
        </div>
      </div>
    );
  }

  if (error && !pdfDoc) {
    return (
      <div className="reader-wrap reader-wrap--error" data-theme="sepia">
        <div className="reader-error">
          <Link to="/books" className="reader-toolbar__exit" style={{ marginBottom: 16 }}>
            <IconArrowLeft style={{ width: 20, height: 20 }} />
            <span>{t('reader.back')}</span>
          </Link>
          <p className="reader-error__message">{error}</p>
          <button type="button" className="btn btn-secondary" onClick={loadPdf} style={{ marginTop: 12 }}>
            {t('reader.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`reader-wrap ${!uiVisible ? 'reader-ui-hidden' : ''}`} data-theme={theme} onMouseMove={uiVisible ? resetHideTimer : undefined}>
      <header className="reader-toolbar reader-toolbar--top">
        <div className="reader-toolbar__left">
          <Link to="/books" className="reader-toolbar__exit" onClick={(e) => isFullscreen && toggleFullscreen()}>
            <IconArrowLeft style={{ width: 24, height: 24 }} />
            <span className="reader-toolbar__exit-label">{t('reader.exit')}</span>
          </Link>
        </div>
        <div className="reader-toolbar__center">
          <h1 className="reader-toolbar__title" title={book?.title}>
            {book?.title}
          </h1>
        </div>
        <div className="reader-toolbar__right">
          <button
            type="button"
            className="reader-toolbar__btn-icon"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="reader-toolbar__btn-icon"
            onClick={() => { setShowTranslate(true); setMenuOpen(false); }}
            aria-label={t('reader.translate')}
          >
            <span className="reader-toolbar__translate-icon">Aa</span>
          </button>
          <button
            type="button"
            className="reader-toolbar__btn-icon"
            onClick={() => { setShowSearch(true); setMenuOpen(false); }}
            aria-label="Search"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <div className="reader-toolbar__menu">
            <button
              type="button"
              className="reader-toolbar__btn-icon"
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              aria-label={t('reader.menuAria')}
            >
              <IconMoreVertical style={{ width: 24, height: 24 }} />
            </button>
            {menuOpen && (
              <div className="reader-menu-dropdown animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="reader-menu-section">
                  <span className="reader-menu-label">Display Settings</span>
                  <div className="reader-menu-row reader-menu-row--zoom">
                    <button
                      type="button"
                      className="reader-menu-btn-icon"
                      onClick={() => { setFitWidth(false); setFitPage(false); setZoomIndex((i) => Math.max(0, i - 1)); }}
                      disabled={zoomIndex <= 0 && !fitWidth && !fitPage}
                    >
                      <IconZoomOut style={{ width: 18, height: 18 }} />
                    </button>
                    <span className="reader-menu-zoom-value">
                      {fitWidth ? t('reader.fitWidth') : fitPage ? t('reader.fitPage') : Math.round((scale ?? 1) * 100) + '%'}
                    </span>
                    <button
                      type="button"
                      className="reader-menu-btn-icon"
                      onClick={() => { setFitWidth(false); setFitPage(false); setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1)); }}
                      disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
                    >
                      <IconZoomIn style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                  <div className="reader-menu-fit-options">
                    <button
                      type="button"
                      className={`reader-menu-theme ${fitWidth ? 'reader-menu-theme--active' : ''}`}
                      onClick={() => { setFitWidth(true); setFitPage(false); setMenuOpen(false); }}
                    >
                      {t('reader.fitWidth')}
                    </button>
                    <button
                      type="button"
                      className={`reader-menu-theme ${fitPage ? 'reader-menu-theme--active' : ''}`}
                      onClick={() => { setFitWidth(false); setFitPage(true); setMenuOpen(false); }}
                    >
                      {t('reader.fitPage')}
                    </button>
                  </div>
                </div>
                <div className="reader-menu-section">
                  <span className="reader-menu-label">Appearance</span>
                  <div className="reader-menu-themes">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        className={`reader-menu-theme-chip ${theme === th.id ? 'reader-menu-theme-chip--active' : ''} reader-menu-theme-chip--${th.id}`}
                        onClick={() => { setTheme(th.id); setMenuOpen(false); }}
                        title={t(th.labelKey)}
                      >
                        <div className="reader-theme-circle" />
                        <span>{t(th.labelKey)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        className="reader-pages"
        ref={containerRef}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') goPrev();
          if (e.key === 'ArrowRight') goNext();
          if (uiVisible) resetHideTimer();
        }}
        tabIndex={0}
      >
        <div className="reader-page-container">
          {pdfLoading && !pdfDoc && (
            <div className="reader-loading-overlay animate-fade-in">
              <Spinner size="lg" />
              <p>{t('reader.bookLoading')}</p>
            </div>
          )}
          <div className="reader-page">
            <canvas ref={canvasRef} />
            <div ref={textLayerRef} className="textLayer" />
          </div>
        </div>
      </div>

      <nav className="reader-nav reader-nav--floating">
        <div className="reader-nav__content" onClick={(e) => e.stopPropagation()}>
          <div className="reader-nav__top">
            <button
              type="button"
              className="reader-nav__arrow"
              onClick={goPrev}
              disabled={currentPage <= 1}
              aria-label={t('reader.prevPage')}
            >
              <IconChevronLeft style={{ width: 28, height: 28 }} />
            </button>
            <div className="reader-nav__progress-text">
              <span className="reader-nav__page-current">{currentPage}</span>
              <span className="reader-nav__page-divider">/</span>
              <span className="reader-nav__page-total">{totalPages}</span>
            </div>
            <button
              type="button"
              className="reader-nav__arrow"
              onClick={goNext}
              disabled={currentPage >= totalPages}
              aria-label={t('reader.nextPage')}
            >
              <IconChevronRight style={{ width: 28, height: 28 }} />
            </button>
          </div>
          <div className="reader-nav__slider-container">
            <input
              type="range"
              min="1"
              max={totalPages || 1}
              value={currentPage}
              onChange={(e) => goToPage(e.target.value)}
              className="reader-nav__slider"
              aria-label="Seek page"
            />
          </div>
          <div className="reader-nav__footer">
            <span className="reader-nav__info">
              {Math.round(progressPct)}% {t('home.read')}
              {minsLeft > 0 && <span className="reader-nav__info-sep"> · </span>}
              {minsLeft > 0 && `${minsLeft} ${t('reader.minLeft')}`}
            </span>
          </div>
        </div>
      </nav>

      {showTranslate && (
        <div className="reader-translate-overlay" onClick={() => setShowTranslate(false)}>
          <div className="reader-translate-panel animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="reader-translate-header">
              <h3>{t('reader.translate')}</h3>
              <button type="button" className="reader-translate-close" onClick={() => setShowTranslate(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="reader-translate-modes">
              <button
                type="button"
                className={`reader-translate-mode-btn ${translateMode === 'page' ? 'reader-translate-mode-btn--active' : ''}`}
                onClick={() => { setTranslateMode('page'); setTranslateError(null); handleTranslatePage(); }}
              >
                {t('reader.translatePage')}
              </button>
              <button
                type="button"
                className={`reader-translate-mode-btn ${translateMode === 'custom' ? 'reader-translate-mode-btn--active' : ''}`}
                onClick={() => { setTranslateMode('custom'); setTranslated(''); setTranslateError(null); }}
              >
                {t('reader.translateCustom')}
              </button>
            </div>
            {translateMode === 'custom' ? (
              <div className="reader-translate-custom">
                <textarea
                  className="reader-translate-textarea"
                  placeholder={t('reader.translatePlaceholder')}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn--block"
                  style={{ marginTop: 12 }}
                  onClick={() => runTranslate(customText)}
                  disabled={!customText.trim() || translateLoading}
                >
                  {translateLoading ? <Spinner size="sm" /> : t('reader.translate')}
                </button>
              </div>
            ) : (
              translateLoading && <div className="reader-translate-loading"><Spinner size="lg" /></div>
            )}
            {translateError && <p className="reader-translate-error">{translateError}</p>}
            {translated && (
              <div className="reader-translate-result animate-fade-in">
                <div className="reader-translate-output">{translated}</div>
                <button type="button" className="btn btn-secondary btn--block" style={{ marginTop: 16 }} onClick={handleCopyTranslation}>
                  {t('reader.copy')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showSearch && (
        <div className="reader-translate-overlay" onClick={() => setShowSearch(false)}>
          <div className="reader-translate-panel animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="reader-translate-header">
              <h3>{t('books.search')}</h3>
              <button type="button" className="reader-translate-close" onClick={() => setShowSearch(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form className="books-search-wrap" style={{ marginTop: 12 }} onSubmit={(e) => {
              e.preventDefault();
              if (!searchQuery.trim()) return;
              setSearchLoading(true);
              setSearchResults([]);
              const results = [];
              const searchPages = async () => {
                for (let i = 1; i <= totalPages; i++) {
                  const p = await pdfDoc.getPage(i);
                  const content = await p.getTextContent();
                  const text = content.items.map(item => item.str).join(' ');
                  if (text.toLowerCase().includes(searchQuery.toLowerCase())) {
                    results.push({ page: i, text: text.trim().slice(0, 100) + '...' });
                  }
                }
                setSearchResults(results);
                setSearchLoading(false);
              };
              searchPages();
            }}>
              <input
                className="books-search-input"
                autoFocus
                placeholder={t('books.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-sm" disabled={searchLoading}>
                {searchLoading ? <Spinner size="sm" /> : t('books.search')}
              </button>
            </form>
            <div className="reader-search-results" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: 16 }}>
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className="reader-search-item"
                  style={{ padding: '12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => {
                    setCurrentPage(res.page);
                    setShowSearch(false);
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>{t('reader.pageNumber')} {res.page}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: 4 }}>{res.text}</div>
                </div>
              ))}
              {!searchLoading && searchQuery && searchResults.length === 0 && (
                <p style={{ textAlign: 'center', padding: '20px', color: 'var(--muted)' }}>{t('books.noResults')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
