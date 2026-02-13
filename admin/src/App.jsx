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
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <div className="w-full max-w-sm rounded-xl bg-slate-800 border border-slate-700 p-6 shadow-xl">
        <h1 className="text-xl font-bold text-center mb-6 text-orange-400">Admin – Kitobxona</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Parol</label>
            <input
              type="password"
              placeholder="Parolni kiriting"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
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
      className={`block px-3 py-2 rounded-lg mb-1 ${active ? 'bg-orange-500/20 text-orange-400' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
    >
      {children}
    </Link>
  );
}

function Layout({ token, onLogout, children }) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <aside className="w-56 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="font-bold text-orange-400">Kitobxona Admin</h2>
        </div>
        <nav className="p-2 flex-1">
          <NavLink to="/">Boshqaruv</NavLink>
          <NavLink to="/categories">Kategoriyalar</NavLink>
          <NavLink to="/books">Kitoblar</NavLink>
        </nav>
        <div className="p-2 border-t border-slate-700">
          <button
            onClick={onLogout}
            className="w-full px-3 py-2 rounded-lg text-left text-slate-400 hover:bg-slate-700 hover:text-white text-sm"
          >
            Chiqish
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
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
      <h1 className="text-2xl font-bold mb-6 text-slate-100">Boshqaruv</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">
          <p className="text-slate-400 text-sm">Kategoriyalar</p>
          <p className="text-2xl font-bold text-orange-400">{stats.categories}</p>
        </div>
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-5">
          <p className="text-slate-400 text-sm">Kitoblar</p>
          <p className="text-2xl font-bold text-orange-400">{stats.books}</p>
        </div>
      </div>
      <p className="text-slate-500 text-sm">Chap menyudan Kategoriyalar yoki Kitoblar bo‘limini tanlang.</p>
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
      .then(() => { setForm({ name_uz: '', slug: '' }); fetch(API + '/categories', { headers: auth() }).then((r) => r.json()).then(setCategories); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-100">Kategoriyalar</h1>
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-5 mb-6 max-w-md">
        <h2 className="font-semibold mb-4 text-slate-200">Yangi kategoriya</h2>
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
          <button type="submit" disabled={loading} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white">
            Qo‘shish
          </button>
        </form>
      </div>
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-slate-400 font-medium">ID</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Nomi</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Slug</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {categories.map((c) => (
              <tr key={c.id} className="bg-slate-800/50 hover:bg-slate-800">
                <td className="px-4 py-3 text-slate-500">{c.id}</td>
                <td className="px-4 py-3 text-slate-100">{c.name_uz}</td>
                <td className="px-4 py-3 text-slate-400">{c.slug}</td>
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
      .then(() => { setUpload({ title: '', author: '', category_id: '', file: null, cover: null }); fetch(API + '/books', { headers: auth() }).then((r) => r.json()).then(setBooks); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const deleteBook = (id) => {
    if (!confirm('O‘chirilsinmi?')) return;
    fetch(API + '/books/' + id, { method: 'DELETE', headers: auth() }).then(() => fetch(API + '/books', { headers: auth() }).then((r) => r.json()).then(setBooks));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-slate-100">Kitoblar</h1>
      <div className="rounded-xl bg-slate-800 border border-slate-700 p-5 mb-6 max-w-lg">
        <h2 className="font-semibold mb-4 text-slate-200">PDF kitob yuklash</h2>
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
              <option key={c.id} value={c.id}>{c.name_uz}</option>
            ))}
          </select>
          <div>
            <label className="block text-sm text-slate-400 mb-1">PDF fayl</label>
            <input type="file" accept=".pdf" onChange={(e) => setUpload((u) => ({ ...u, file: e.target.files?.[0] || null }))} className="w-full text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Muqova (ixtiyoriy)</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setUpload((u) => ({ ...u, cover: e.target.files?.[0] || null }))} className="w-full text-sm" />
          </div>
          <button type="submit" disabled={loading || !upload.file} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50">
            Yuklash
          </button>
        </form>
      </div>
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-slate-400 font-medium">Nomi</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Muallif</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Sahifa</th>
              <th className="px-4 py-3 text-slate-400 font-medium w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {books.map((b) => (
              <tr key={b.id} className="bg-slate-800/50 hover:bg-slate-800">
                <td className="px-4 py-3 text-slate-100">{b.title}</td>
                <td className="px-4 py-3 text-slate-400">{b.author || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{b.page_count || '?'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => deleteBook(b.id)} className="text-red-400 hover:text-red-300 text-sm">O‘chirish</button>
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
        <Route path="/" element={<Layout token={token} onLogout={onLogout}><DashboardHome token={token} /></Layout>} />
        <Route path="/categories" element={<Layout token={token} onLogout={onLogout}><CategoriesPage token={token} /></Layout>} />
        <Route path="/books" element={<Layout token={token} onLogout={onLogout}><BooksPage token={token} /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
