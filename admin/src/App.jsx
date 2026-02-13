import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

const API = '/api/admin';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) onLogin(data.token);
        else setError('Noto‘g‘ri parol');
      })
      .catch(() => setError('Xatolik'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-app-bg">
      <div className="w-full max-w-sm rounded-app bg-app-surface border border-app-border p-6 shadow-app-card">
        <h1 className="text-xl font-bold text-center mb-6 text-app-accent">Sphere · Admin</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-app-muted mb-1">Parol</label>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-app-accent hover:bg-app-accent-hover text-white font-semibold rounded-app-sm disabled:opacity-50 transition-colors"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  );
}

function NavLink({ to, children }) {
  const loc = useLocation();
  const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`block px-3 py-2.5 rounded-app-sm mb-1 text-sm font-medium transition-colors ${
        active
          ? 'bg-app-accent-soft text-app-accent'
          : 'text-app-muted hover:bg-app-surface-hover hover:text-app-text'
      }`}
    >
      {children}
    </Link>
  );
}

function Layout({ token, onLogout, children }) {
  return (
    <div className="flex min-h-screen bg-app-bg">
      <aside className="w-56 flex-shrink-0 bg-app-bg-elevated border-r border-app-border flex flex-col shadow-app">
        <div className="p-4 border-b border-app-border">
          <h2 className="font-bold text-app-accent text-lg">Sphere Admin</h2>
        </div>
        <nav className="p-2 flex-1">
          <NavLink to="/">Boshqaruv</NavLink>
          <NavLink to="/categories">Kategoriyalar</NavLink>
          <NavLink to="/books">Kitoblar</NavLink>
        </nav>
        <div className="p-2 border-t border-app-border">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2.5 rounded-app-sm text-left text-app-muted hover:bg-app-surface-hover hover:text-app-text text-sm font-medium"
          >
            Chiqish
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6 bg-app-bg">{children}</main>
    </div>
  );
}

function DashboardHome({ token }) {
  const [stats, setStats] = useState({ categories: 0, books: 0 });
  const auth = () => ({ Authorization: 'Bearer ' + token });

  useEffect(() => {
    Promise.all([
      fetch(API + '/categories', { headers: auth() }).then((r) => r.json()),
      fetch(API + '/books', { headers: auth() }).then((r) => r.json()),
    ]).then(([cats, books]) => setStats({ categories: cats.length, books: books.length }));
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-app-text">Boshqaruv</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-app bg-app-surface border border-app-border p-5 shadow-app-card">
          <p className="text-app-muted text-sm font-medium">Kategoriyalar</p>
          <p className="text-2xl font-bold text-app-accent mt-1">{stats.categories}</p>
        </div>
        <div className="rounded-app bg-app-surface border border-app-border p-5 shadow-app-card">
          <p className="text-app-muted text-sm font-medium">Kitoblar</p>
          <p className="text-2xl font-bold text-app-accent mt-1">{stats.books}</p>
        </div>
      </div>
      <p className="text-app-muted text-sm">Chap menyudan Kategoriyalar yoki Kitoblar bo‘limini tanlang.</p>
    </div>
  );
}

function CategoriesPage({ token }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name_uz: '', slug: '' });
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: 'Bearer ' + token });

  useEffect(() => {
    fetch(API + '/categories', { headers: auth() }).then((r) => r.json()).then(setCategories);
  }, [token]);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name_uz || !form.slug) return;
    setLoading(true);
    fetch(API + '/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth() },
      body: JSON.stringify(form),
    })
      .then((r) => r.json())
      .then(() => {
        setForm({ name_uz: '', slug: '' });
        fetch(API + '/categories', { headers: auth() }).then((r) => r.json()).then(setCategories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-app-text">Kategoriyalar</h1>
      <div className="rounded-app bg-app-surface border border-app-border p-5 mb-6 max-w-md shadow-app-card">
        <h2 className="font-semibold mb-4 text-app-text">Yangi kategoriya</h2>
        <form onSubmit={submit} className="space-y-3">
          <input
            placeholder="Nomi (uz)"
            value={form.name_uz}
            onChange={(e) => setForm((c) => ({ ...c, name_uz: e.target.value }))}
            className="w-full"
          />
          <input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm((c) => ({ ...c, slug: e.target.value }))}
            className="w-full"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-app-accent hover:bg-app-accent-hover text-white font-semibold rounded-app-sm disabled:opacity-50"
          >
            Qo‘shish
          </button>
        </form>
      </div>
      <div className="rounded-app border border-app-border overflow-hidden bg-app-surface shadow-app-card">
        <table className="w-full text-left">
          <thead className="bg-app-bg-elevated">
            <tr>
              <th className="px-4 py-3 text-app-muted font-medium text-sm">ID</th>
              <th className="px-4 py-3 text-app-muted font-medium text-sm">Nomi</th>
              <th className="px-4 py-3 text-app-muted font-medium text-sm">Slug</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-app-surface-hover transition-colors">
                <td className="px-4 py-3 text-app-muted text-sm">{c.id}</td>
                <td className="px-4 py-3 text-app-text font-medium">{c.name_uz}</td>
                <td className="px-4 py-3 text-app-muted text-sm">{c.slug}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BooksPage({ token }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [upload, setUpload] = useState({ title: '', author: '', category_id: '', file: null, cover: null });
  const [loading, setLoading] = useState(false);
  const auth = () => ({ Authorization: 'Bearer ' + token });

  useEffect(() => {
    fetch(API + '/categories', { headers: auth() }).then((r) => r.json()).then(setCategories);
    fetch(API + '/books', { headers: auth() }).then((r) => r.json()).then(setBooks);
  }, [token]);

  const uploadBook = (e) => {
    e.preventDefault();
    if (!upload.title || !upload.category_id || !upload.file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('pdf', upload.file);
    if (upload.cover) fd.append('cover', upload.cover);
    fd.append('title', upload.title);
    fd.append('author', upload.author);
    fd.append('category_id', upload.category_id);
    fetch(API + '/books', { method: 'POST', headers: auth(), body: fd })
      .then((r) => r.json())
      .then(() => {
        setUpload({ title: '', author: '', category_id: '', file: null, cover: null });
        fetch(API + '/books', { headers: auth() }).then((r) => r.json()).then(setBooks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const deleteBook = (id) => {
    if (!confirm('O‘chirilsinmi?')) return;
    fetch(API + '/books/' + id, { method: 'DELETE', headers: auth() }).then(() =>
      fetch(API + '/books', { headers: auth() }).then((r) => r.json()).then(setBooks)
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-app-text">Kitoblar</h1>
      <div className="rounded-app bg-app-surface border border-app-border p-5 mb-6 max-w-lg shadow-app-card">
        <h2 className="font-semibold mb-4 text-app-text">PDF kitob yuklash</h2>
        <form onSubmit={uploadBook} className="space-y-3">
          <input
            placeholder="Kitob nomi"
            value={upload.title}
            onChange={(e) => setUpload((u) => ({ ...u, title: e.target.value }))}
            className="w-full"
            required
          />
          <input
            placeholder="Muallif"
            value={upload.author}
            onChange={(e) => setUpload((u) => ({ ...u, author: e.target.value }))}
            className="w-full"
          />
          <select
            value={upload.category_id}
            onChange={(e) => setUpload((u) => ({ ...u, category_id: e.target.value }))}
            className="w-full"
            required
          >
            <option value="">Kategoriyani tanlang</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_uz}
              </option>
            ))}
          </select>
          <div>
            <label className="block text-sm text-app-muted mb-1 font-medium">PDF fayl</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setUpload((u) => ({ ...u, file: e.target.files?.[0] || null }))}
              className="w-full text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-app-muted mb-1 font-medium">Muqova (ixtiyoriy)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setUpload((u) => ({ ...u, cover: e.target.files?.[0] || null }))}
              className="w-full text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !upload.file}
            className="px-4 py-2.5 bg-app-accent hover:bg-app-accent-hover text-white font-semibold rounded-app-sm disabled:opacity-50"
          >
            Yuklash
          </button>
        </form>
      </div>
      <div className="rounded-app border border-app-border overflow-hidden bg-app-surface shadow-app-card">
        <table className="w-full text-left">
          <thead className="bg-app-bg-elevated">
            <tr>
              <th className="px-4 py-3 text-app-muted font-medium text-sm">Nomi</th>
              <th className="px-4 py-3 text-app-muted font-medium text-sm">Muallif</th>
              <th className="px-4 py-3 text-app-muted font-medium text-sm">Sahifa</th>
              <th className="px-4 py-3 text-app-muted font-medium text-sm w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {books.map((b) => (
              <tr key={b.id} className="hover:bg-app-surface-hover transition-colors">
                <td className="px-4 py-3 text-app-text font-medium">{b.title}</td>
                <td className="px-4 py-3 text-app-muted">{b.author || '—'}</td>
                <td className="px-4 py-3 text-app-muted text-sm">{b.page_count || '?'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteBook(b.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    O‘chirish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');

  useEffect(() => {
    if (token) localStorage.setItem('adminToken', token);
  }, [token]);

  const onLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
  };

  if (!token) return <Login onLogin={setToken} />;

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout token={token} onLogout={onLogout}>
              <DashboardHome token={token} />
            </Layout>
          }
        />
        <Route
          path="/categories"
          element={
            <Layout token={token} onLogout={onLogout}>
              <CategoriesPage token={token} />
            </Layout>
          }
        />
        <Route
          path="/books"
          element={
            <Layout token={token} onLogout={onLogout}>
              <BooksPage token={token} />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
