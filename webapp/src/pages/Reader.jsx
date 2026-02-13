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

  const [fitPage, setFitPage] = useState(() => typeof localStorage !== 'undefined' ? localStorage.getItem('readerFitPage') === 'true' : false);
  const scale = fitWidth ? null : fitPage ? null : ZOOM_LEVELS[zoomIndex];

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
      await page.render({ canvasContext: ctx, viewport }).promise;
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
    if (x < w * 0.2) goPrev();
    else if (x > w * 0.8) goNext();
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
    <div className={`reader-wrap ${!uiVisible ? 'reader-ui-hidden' : ''}`} data-theme={theme}>
      {uiVisible && (
        <header className="reader-toolbar reader-toolbar--top" onClick={(e) => e.stopPropagation()}>
          <Link to="/books" className="reader-toolbar__exit">
            <IconArrowLeft style={{ width: 20, height: 20 }} />
            <span className="reader-toolbar__exit-label">{t('reader.exit')}</span>
          </Link>
          <h1 className="reader-toolbar__title" title={book?.title}>
            {book?.title ? (book.title.length > 22 ? book.title.slice(0, 22) + '…' : book.title) : t('reader.pageTitle')}
          </h1>
          <span className="reader-progress reader-progress--center" title={t('reader.progressHint')}>
            <span className="reader-progress__pct">{Math.round(progressPct)}%</span>
            <span className="reader-progress__sep"> · </span>
            {currentPage}<span className="reader-progress__sep">/</span>{totalPages}
            {minsLeft > 0 && (
              <>
                <span className="reader-progress__sep"> · </span>
                <span className="reader-progress__time">{minsLeft} {t('reader.minLeft')}</span>
              </>
            )}
          </span>
          <div className="reader-toolbar__right">
            <button
              type="button"
              className="reader-toolbar__menu-btn"
              onClick={() => { setShowTranslate(true); setMenuOpen(false); }}
              aria-label={t('reader.translate')}
            >
              <span className="reader-toolbar__translate-icon">Aa</span>
            </button>
            <div className="reader-toolbar__menu">
              <button
                type="button"
                className="reader-toolbar__menu-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={t('reader.menuAria')}
              >
                <IconMoreVertical style={{ width: 22, height: 22 }} />
              </button>
              {menuOpen && (
                <div className="reader-menu-dropdown">
                  <div className="reader-menu-row reader-menu-row--zoom">
                    <button
                      type="button"
                      className="reader-menu-btn-icon"
                      onClick={() => { setFitWidth(false); setFitPage(false); setZoomIndex((i) => Math.max(0, i - 1)); }}
                      disabled={zoomIndex <= 0 && !fitWidth && !fitPage}
                      aria-label={t('reader.zoomOut')}
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
                      aria-label={t('reader.zoomIn')}
                    >
                      <IconZoomIn style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                  <div className="reader-menu-row reader-menu-fit-options">
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
                  <div className="reader-menu-row reader-menu-themes">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        className={theme === th.id ? 'reader-menu-theme reader-menu-theme--active' : 'reader-menu-theme'}
                        onClick={() => {
                          setTheme(th.id);
                          setMenuOpen(false);
                        }}
                      >
                        {t(th.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {pdfLoading && !pdfDoc && (
        <div className="reader-loading reader-loading--overlay">
          <Spinner size="lg" />
          <p className="reader-loading__text">{t('reader.bookLoading')}</p>
        </div>
      )}

      <div
        className="reader-pages"
        ref={containerRef}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={uiVisible ? resetHideTimer : undefined}
        onTouchMove={uiVisible ? resetHideTimer : undefined}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') goPrev();
          if (e.key === 'ArrowRight') goNext();
          if (uiVisible) resetHideTimer();
        }}
        aria-label={t('reader.pageAria')}
      >
        <div className="reader-page">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {uiVisible && (
        <nav className="reader-nav reader-nav--kindle" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="reader-nav__btn reader-nav__btn--prev"
            onClick={goPrev}
            disabled={currentPage <= 1}
          >
            <IconChevronLeft style={{ width: 22, height: 22 }} />
            <span className="reader-nav__label">{t('reader.prevPage')}</span>
          </button>
          <div className="reader-nav__center">
            <form className="reader-nav__page-jump" onSubmit={handlePageInputSubmit}>
              <input
                type="number"
                min={1}
                max={totalPages || 1}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => goToPage(pageInput)}
                className="reader-nav__page-input"
                aria-label={t('reader.pageNumber')}
              />
            </form>
            <span className="reader-nav__of">{currentPage} / {totalPages}</span>
            {minsLeft > 0 && (
              <span className="reader-nav__time-left">{minsLeft} {t('reader.minLeft')}</span>
            )}
            <div className="reader-progress-bar reader-progress-bar--bottom">
              <div className="reader-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <button
            type="button"
            className="reader-nav__btn reader-nav__btn--next"
            onClick={goNext}
            disabled={currentPage >= totalPages}
          >
            <span className="reader-nav__label">{t('reader.nextPage')}</span>
            <IconChevronRight style={{ width: 22, height: 22 }} />
          </button>
        </nav>
      )}

      {showTranslate && (
        <div className="reader-translate-overlay" onClick={() => setShowTranslate(false)} role="button" tabIndex={0} aria-label={t('common.close')}>
          <div className="reader-translate-panel" onClick={(e) => e.stopPropagation()}>
            <div className="reader-translate-header">
              <h3>{t('reader.translate')}</h3>
              <button type="button" className="btn btn-secondary" style={{ padding: '8px 16px', minHeight: 36 }} onClick={() => setShowTranslate(false)}>
                {t('common.close')}
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
            {translateMode === 'custom' && (
              <div className="reader-translate-custom">
                <textarea
                  className="reader-translate-textarea"
                  placeholder={t('reader.translatePlaceholder')}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  rows={3}
                />
                <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => runTranslate(customText)} disabled={!customText.trim() || translateLoading}>
                  {translateLoading ? t('common.loading') : t('reader.translate')}
                </button>
              </div>
            )}
            {(translateLoading && translateMode === 'page') && (
              <div className="reader-translate-loading"><Spinner size="lg" /> <span>{t('common.loading')}</span></div>
            )}
            {translateError && <p className="reader-translate-error">{translateError}</p>}
            {translated && (
              <div className="reader-translate-result">
                <p className="reader-translate-label">{t('reader.translated')}</p>
                <div className="reader-translate-output">{translated}</div>
                <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={handleCopyTranslation}>
                  {t('reader.copy')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
