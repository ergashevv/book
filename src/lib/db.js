import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;

// Singleton to avoid too many connections in Next.js development
if (!global.sql) {
  global.sql = postgres(connectionString, {
    ssl: 'require',
    max: 10,
    idle_timeout: 30,
    connect_timeout: 30
  });
}

const sql = global.sql;

// Initialize Schema in PostgreSQL (Supabase works with standard SQL)
async function initSchema() {
  try {
    // Categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_uz TEXT NOT NULL,
        name_ru TEXT,
        slug TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Books table
    await sql`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        title TEXT NOT NULL,
        author TEXT,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        page_count INTEGER DEFAULT 0,
        cover_url TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Reading Progress table
    await sql`
      CREATE TABLE IF NOT EXISTS reading_progress (
        user_id BIGINT NOT NULL,
        book_id INTEGER NOT NULL REFERENCES books(id),
        page_number INTEGER NOT NULL DEFAULT 1,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, book_id)
      );
    `;
    
    // Seed default category if empty
    const cats = await sql`SELECT count(*) FROM categories`;
    if (parseInt(cats[0].count) === 0) {
      await sql`INSERT INTO categories (name_uz, slug) VALUES ('Boshqa', 'boshqa')`;
    }
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
}

// Call but don't await blocking (it will run in the background)
initSchema();

export default sql;
