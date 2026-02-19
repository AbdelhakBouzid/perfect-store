import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./store.db");

export function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        emoji TEXT NOT NULL,
        description TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT DEFAULT '',
        created_at TEXT NOT NULL
      )
    `);

    db.all(`PRAGMA table_info(products)`, (err, cols) => {
      if (err) return;
      const hasImage = cols.some((c) => c.name === "image_url");
      if (!hasImage) db.run(`ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT ''`);
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        notes TEXT,
        items_json TEXT NOT NULL,
        subtotal REAL NOT NULL,
        shipping REAL NOT NULL,
        total REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'NEW',
        created_at TEXT NOT NULL
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    db.get("SELECT COUNT(*) as c FROM products", (err, row) => {
      if (err) return;
      if (row.c === 0) {
        const now = new Date().toISOString();
        const stmt = db.prepare(`
          INSERT INTO products (name, price, category, emoji, description, stock, image_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const seed = [
          ["Wireless Headphones", 199, "Electronics", "🎧", "Deep bass and long battery life.", 25, "", now],
          ["Smart Watch", 349, "Electronics", "⌚", "Fitness tracking and notifications.", 12, "", now],
          ["Premium Hoodie", 159, "Fashion", "🧥", "Soft, warm and comfortable.", 30, "", now],
          ["Running Shoes", 299, "Fashion", "👟", "Lightweight support for daily runs.", 18, "", now],
          ["Coffee Grinder", 149, "Home", "☕", "Fast grinding with easy cleanup.", 10, "", now]
        ];

        for (const p of seed) stmt.run(p);
        stmt.finalize();
      }
    });
  });
}
