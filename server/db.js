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

    // Migration: add image_url if missing
    db.all(`PRAGMA table_info(products)`, (err, cols) => {
      if (err) return;
      const hasImage = cols.some(c => c.name === "image_url");
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

    // Seed products if empty
    db.get("SELECT COUNT(*) as c FROM products", (err, row) => {
      if (err) return;
      if (row.c === 0) {
        const now = new Date().toISOString();
        const stmt = db.prepare(`
          INSERT INTO products (name, price, category, emoji, description, stock, image_url, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const seed = [
          ["سماعات بلوتوث", 199, "إلكترونيات", "🎧", "صوت واضح وبطارية مزيانة.", 25, "", now],
          ["ساعة ذكية", 349, "إلكترونيات", "⌚", "قياس خطوات وإشعارات.", 12, "", now],
          ["هودي", 159, "ملابس", "🧥", "مريح ودافئ.", 30, "", now],
          ["حذاء رياضي", 299, "ملابس", "👟", "راحة وثبات.", 18, "", now],
          ["مطحنة قهوة", 149, "المنزل", "☕", "طحن سريع وتنظيف سهل.", 10, "", now]
        ];

        for (const p of seed) stmt.run(p);
        stmt.finalize();
      }
    });
  });
}
