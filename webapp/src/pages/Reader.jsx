import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { apiGet, apiPost, fetchBookFile } from '../api';

// PDF.js - CDN dan yuklanadi (index.html da script)
const pdfjsLib = window.pdfjsLib;

export default function Reader({ initData }) {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Kitob ma'lumotlari va progress
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

  // PDF yuklash (arraybuffer)
  useEffect(() => {
    if (!bookId || !book) return;
    setLoading(true);
    fetchBookFile(bookId, initData)
      .then((arrayBuffer) => {
        if (!pdfjsLib) {
          setError('PDF.js yuklanmadi. Internetingizni tekshiring.');
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
        setError(e.message || 'PDF yuklanmadi');
        setLoading(false);
      });
  }, [bookId, book]);

  // Sahifani chizish
  const renderPage = useCallback(
    async (pageNum) => {
      if (!pdfDoc || !canvasRef.current) return;
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const container = containerRef.current;
      const maxWidth = container ? container.clientWidth - 32 : 320;
      const scale = Math.min(maxWidth / page.getViewport({ scale: 1 }).width, 2.5);
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (currentPage >= 1 && currentPage <= totalPages) renderPage(currentPage);
  }, [currentPage, totalPages, renderPage]);

  // Progress saqlash (debounce)
  useEffect(() => {
    if (!bookId || currentPage < 1 || !initData) return;
    const t = setTimeout(() => {
      apiPost(`/books/${bookId}/progress`, { page_number: currentPage }, initData).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [bookId, currentPage, initData]);

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  if (loading && !pdfDoc) {
    return (
      <div className="app">
        <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          Kitob yuklanmoqda...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <header className="header">
          <Link to="/books">← Orqaga</Link>
        </header>
        <div className="content">
          <div className="card">
            <p style={{ color: 'var(--accent)' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app reader-wrap">
      <header className="header reader-toolbar">
        <Link to="/books" style={{ color: 'var(--text)' }}>← Chiqish</Link>
        <span className="reader-progress">
          {currentPage} / {totalPages}
        </span>
        <span style={{ width: 48 }} />
      </header>

      <div className="reader-pages" ref={containerRef}>
        <div className="reader-page">
          <canvas ref={canvasRef} />
        </div>
      </div>

      <nav className="reader-nav">
        <button type="button" onClick={goPrev} disabled={currentPage <= 1}>
          ← Oldingi
        </button>
        <span className="reader-progress" style={{ minWidth: 80, textAlign: 'center' }}>
          {currentPage} / {totalPages}
        </span>
        <button type="button" onClick={goNext} disabled={currentPage >= totalPages}>
          Keyingi →
        </button>
      </nav>
    </div>
  );
}
