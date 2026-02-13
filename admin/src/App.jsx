import { useState, useEffect } from 'react';

const API = '/api/admin';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = (e) => {
    e.preventDefault();
    setError('');
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
      .catch(() => setError('Xatolik'));
  };
  return (
    <div className="card">
      <h1>Admin kirish</h1>
      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="Parol"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button type="submit" style={{ marginLeft: 8 }}>Kirish</button>
      </form>
      {error && <p style={{ color: '#e94560', marginTop: 8 }}>{error}</p>}
    </div>
  );
}

function Dashboard({ token }) {
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [newCat, setNewCat] = useState({ name_uz: '', slug: '' });
  const [upload, setUpload] = useState({ title: '', author: '', category_id: '', file: null });
  const [loading, setLoading] = useState(false);

  const auth = () => ({ Authorization: 'Bearer ' + token });

  const load = () => {
    fetch(API + '/categories', { headers: auth() }).then((r) => r.json()).then(setCategories);
    fetch(API + '/books', { headers: auth() }).then((r) => r.json()).then(setBooks);
  };

  useEffect(() => { load(); }, [token]);

  const addCategory = (e) => {
    e.preventDefault();
    if (!newCat.name_uz || !newCat.slug) return;
    setLoading(true);
    fetch(API + '/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth() },
      body: JSON.stringify(newCat),
    })
      .then((r) => r.json())
      .then(() => { setNewCat({ name_uz: '', slug: '' }); load(); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const uploadBook = (e) => {
    e.preventDefault();
    if (!upload.title || !upload.category_id || !upload.file) return;
    const fd = new FormData();
    fd.append('pdf', upload.file);
    fd.append('title', upload.title);
    fd.append('author', upload.author);
    fd.append('category_id', upload.category_id);
    setLoading(true);
    fetch(API + '/books', {
      method: 'POST',
      headers: auth(),
      body: fd,
    })
      .then((r) => r.json())
      .then(() => { setUpload({ title: '', author: '', category_id: '', file: null }); load(); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const deleteBook = (id) => {
    if (!confirm('O‘chirilsinmi?')) return;
    fetch(API + '/books/' + id, { method: 'DELETE', headers: auth() })
      .then(() => load());
  };

  return (
    <>
      <h1>Admin – Kitobxona</h1>

      <div className="card">
        <h2>Yangi kategoriya</h2>
        <form onSubmit={addCategory}>
          <input
            placeholder="Nomi (uz)"
            value={newCat.name_uz}
            onChange={(e) => setNewCat((c) => ({ ...c, name_uz: e.target.value }))}
          />
          <input
            placeholder="Slug"
            value={newCat.slug}
            onChange={(e) => setNewCat((c) => ({ ...c, slug: e.target.value }))}
            style={{ marginLeft: 8 }}
          />
          <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>Qo‘shish</button>
        </form>
      </div>

      <div className="card">
        <h2>PDF kitob yuklash</h2>
        <form onSubmit={uploadBook}>
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="Kitob nomi"
              value={upload.title}
              onChange={(e) => setUpload((u) => ({ ...u, title: e.target.value }))}
              style={{ width: '100%', marginBottom: 4 }}
            />
            <input
              placeholder="Muallif"
              value={upload.author}
              onChange={(e) => setUpload((u) => ({ ...u, author: e.target.value }))}
              style={{ width: '100%', marginBottom: 4 }}
            />
            <select
              value={upload.category_id}
              onChange={(e) => setUpload((u) => ({ ...u, category_id: e.target.value }))}
              style={{ width: '100%', marginBottom: 4 }}
            >
              <option value="">Kategoriyani tanlang</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name_uz}</option>
              ))}
            </select>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setUpload((u) => ({ ...u, file: e.target.files?.[0] || null }))}
            />
          </div>
          <button type="submit" disabled={loading || !upload.file}>Yuklash</button>
        </form>
      </div>

      <div className="card">
        <h2>Kitoblar ({books.length})</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {books.map((b) => (
            <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '8px 0', borderBottom: '1px solid #333' }}>
              <span><strong>{b.title}</strong> {b.author && `– ${b.author}`} ({b.page_count || '?'} sahifa)</span>
              <button className="secondary" onClick={() => deleteBook(b.id)}>O‘chirish</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');

  useEffect(() => {
    if (token) localStorage.setItem('adminToken', token);
  }, [token]);

  return (
    <div>
      {!token ? (
        <Login onLogin={setToken} />
      ) : (
        <>
          <button className="secondary" style={{ marginBottom: 16 }} onClick={() => { setToken(''); localStorage.removeItem('adminToken'); }}>Chiqish</button>
          <Dashboard token={token} />
        </>
      )}
    </div>
  );
}
