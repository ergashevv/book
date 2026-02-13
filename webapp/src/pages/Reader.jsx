import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { apiGet, apiPost, fetchBookFile } from '../api';
import { useLang } from '../contexts/LangContext';
import { IconArrowLeft, IconMoreVertical, IconZoomOut, IconZoomIn, IconChevronLeft, IconChevronRight } from '../components/Icons';
import Spinner from '../components/Spinner';

const pdfjsLib = window.pdfjsLib;
const ZOOM_LEVELS = [0.75, 1, 1.25, 1.5, 1.75, 2];

export default function Reader({ initData }) {
  const { t } = useLang();
  const THEMES = [
    { id: 'sepia', labelKey: 'reader.sepia' },
    { id: 'light', labelKey: 'reader.light' },
    { id: 'dark', labelKey: 'reader.dark' },
  ];
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('readerTheme') || 'sepia');
  const [zoomIndex, setZoomIndex] = useState(() => {
    const s = localStorage.getItem('readerZoom');
    const i = parseInt(s, 10);
    return Number.isFinite(i) && i >= 0 && i < ZOOM_LEVELS.length ? i : 1;
  });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [uiVisible, setUiVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const touchStartX = useRef(0);
  const didSwipe = useRef(false);

  const scale = ZOOM_LEVELS[zoomIndex];

  useEffect(() => {
    localStorage.setItem('readerTheme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('readerZoom', String(zoomIndex));
  }, [zoomIndex]);

  useEffect(() => {
    if (!bookId) return;
    apiGet(`/books/${bookId}`, initData)
      .then((b) => {
        setBook(b);
        return apiGet(`/books/${bookId}/progress`, initData);
      })
      .then((p) => setCurrentPage(p.page_number))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bookId, initData]);

  useEffect(() => {
    if (book) document.title = `${book.title} · Kitobxona`;
    return () => { document.title = 'Kitobxona'; };
  }, [book]);

  useEffect(() => {
    if (!bookId || !book) return;
    setLoading(true);
    fetchBookFile(bookId, initData)
      .then((arrayBuffer) => {
        if (!pdfjsLib) {
          setError(t('reader.pdfJsError'));
          return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      })
      .then((doc) => {
        if (!doc) return;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || t('reader.pdfError'));
        setLoading(false);
      });
  }, [bookId, book, t]);

  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfDoc || !canvasRef.current) return;
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const container = containerRef.current;
      const baseWidth = page.getViewport({ scale: 1 }).width;
      const maxWidth = container ? container.clientWidth : 360;
      const dpr = Math.max(2, window.devicePixelRatio || 2);
      const scaleLogical = Math.min((maxWidth / baseWidth) * scale, 3);
      const scaleRender = scaleLogical * dpr;
      const viewport = page.getViewport({ scale: scaleRender });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = viewport.width / dpr + 'px';
      canvas.style.height = viewport.height / dpr + 'px';
      await page.render({ canvasContext: ctx, viewport }).promise;
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    if (currentPage >= 1 && currentPage <= totalPages) renderPage(currentPage);
  }, [currentPage, totalPages, renderPage]);

  useEffect(() => {
    if (!bookId || currentPage < 1 || !initData) return;
    const t = setTimeout(() => {
      apiPost(`/books/${bookId}/progress`, { page_number: currentPage }, initData).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [bookId, currentPage, initData]);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handleTap = (e) => {
    if (didSwipe.current) { didSwipe.current = false; return; }
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
    else { setUiVisible(false); setMenuOpen(false); }
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

  if (loading && !pdfDoc) {
    return (
      <div className="app app--loading">
        <div className="content content--center">
          <Spinner size="lg" />
          <p className="loading-text">{t('reader.bookLoading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="content">
          <Link to="/books" className="back-link">
            <IconArrowLeft style={{ width: 18, height: 18, verticalAlign: 'middle', marginRight: 4 }} />
            {t('reader.back')}
          </Link>
          <div className="card card--static error-card">
            <p className="home-error">{error}</p>
            <Link to="/books" className="btn btn-secondary" style={{ marginTop: 12 }}>{t('reader.back')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`reader-wrap ${!uiVisible ? 'reader-ui-hidden' : ''}`} data-theme={theme}>
      {uiVisible && (
        <header className="reader-toolbar reader-toolbar--minimal" onClick={(e) => e.stopPropagation()}>
          <Link to="/books" className="reader-toolbar__exit">
            <IconArrowLeft style={{ width: 20, height: 20 }} />
            <span>{t('reader.exit')}</span>
          </Link>
          <span className="reader-progress reader-progress--center">
            {currentPage} <span className="reader-progress__sep">/</span> {totalPages}
          </span>
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
                  <button type="button" className="reader-menu-btn-icon" onClick={() => setZoomIndex((i) => Math.max(0, i - 1))} disabled={zoomIndex <= 0} aria-label={t('reader.zoomOut')}>
                    <IconZoomOut style={{ width: 18, height: 18 }} />
                  </button>
                  <span className="reader-menu-zoom-value">{Math.round(scale * 100)}%</span>
                  <button type="button" className="reader-menu-btn-icon" onClick={() => setZoomIndex((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))} disabled={zoomIndex >= ZOOM_LEVELS.length - 1} aria-label={t('reader.zoomIn')}>
                    <IconZoomIn style={{ width: 18, height: 18 }} />
                  </button>
                </div>
                <div className="reader-menu-row reader-menu-themes">
                  {THEMES.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      className={theme === th.id ? 'reader-menu-theme reader-menu-theme--active' : 'reader-menu-theme'}
                      onClick={() => { setTheme(th.id); setMenuOpen(false); }}
                    >
                      {t(th.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      <div
        className="reader-pages"
        ref={containerRef}
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'ArrowLeft') goPrev(); if (e.key === 'ArrowRight') goNext(); }}
        aria-label={t('reader.pageAria')}
      >
        <div className="reader-page">
          <canvas ref={canvasRef} />
        </div>
      </div>

      {uiVisible && (
        <nav className="reader-nav reader-nav--minimal" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="reader-nav__btn" onClick={goPrev} disabled={currentPage <= 1}>
            <IconChevronLeft style={{ width: 22, height: 22 }} />
            <span>{t('reader.prevPage')}</span>
          </button>
          <div className="reader-progress-bar">
            <div className="reader-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <button type="button" className="reader-nav__btn" onClick={goNext} disabled={currentPage >= totalPages}>
            <span>{t('reader.nextPage')}</span>
            <IconChevronRight style={{ width: 22, height: 22 }} />
          </button>
        </nav>
      )}
    </div>
  );
}
