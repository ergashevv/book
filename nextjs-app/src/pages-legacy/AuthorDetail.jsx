import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { IconSearch, IconArrowLeft } from '../components/Icons';
import { useTelegram } from '../useTelegram';
import { fetchAuthorById, fetchBooks } from '../api/content';
import BookCover from '../components/BookCover';

export default function AuthorDetail() {
  const { authorId } = useParams();
  const { initData } = useTelegram();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authorId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchAuthorById(authorId, initData), fetchBooks(initData)])
      .then(([a, allBooks]) => {
        if (cancelled) return;
        setAuthor(a ?? null);
        if (a?.bookIds?.length) {
          const byId = allBooks.filter((b) => a.bookIds.includes(b.id));
          setBooks(byId.length ? byId : allBooks.slice(0, 4));
        } else {
          setBooks(allBooks.slice(0, 4));
        }
      })
      .catch(() => {
        if (!cancelled) setAuthor(null);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authorId, initData]);

  if (loading && !author) {
    return (
      <div className="content">
        <header className="page-header">
          <Link to="/authors" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
          <h1 className="page-header__title">Authors</h1>
        </header>
        <div className="skeleton-card" style={{ minHeight: 200 }} />
      </div>
    );
  }

  if (!author) {
    return (
      <div className="content">
        <Link to="/authors">← Back to Authors</Link>
        <p>Author not found</p>
      </div>
    );
  }

  return (
    <div className="content">
      <header className="page-header">
        <Link to="/authors" className="page-header__back"><IconArrowLeft style={{ width: 24, height: 24 }} /></Link>
        <h1 className="page-header__title">Authors</h1>
        <Link to="/search" className="page-header__icon"><IconSearch style={{ width: 22, height: 22 }} /></Link>
      </header>
      <div className="author-detail">
        <div className="author-detail__avatar" style={author.image ? { backgroundImage: `url(${author.image})`, backgroundSize: 'cover' } : {}} />
        <p className="author-detail__role">{author.role}</p>
        <h2 className="author-detail__name">{author.name}</h2>
        <div className="author-detail__rating">★ {author.rating}</div>
        <section className="author-detail__about">
          <h3>About</h3>
          <p>{author.bio || 'No description.'}</p>
        </section>
        <section className="author-detail__products">
          <h3>Products</h3>
          <div className="author-detail__books">
            {books.map((book) => (
              <Link key={book.id} to={`/books/${book.id}/detail`} className="author-book">
                <BookCover coverUrl={book.coverUrl} size="md" alt="" />
                <span className="author-book__title">{book.title}</span>
                <span className="author-book__price">${book.price.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
