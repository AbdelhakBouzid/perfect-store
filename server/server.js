import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { db, initDb } from "./db.js";

dotenv.config();
initDb();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "changeme";

function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized (admin token missing/invalid)" });
  }
  next();
}

function calcShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= 600 ? 0 : 39;
}

// -------- Upload setup --------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ✅ serve uploaded images + cache
app.use("/uploads", express.static(uploadsDir, {
  maxAge: "7d"
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 8 ? ext : ".jpg";
    const name = `p_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`;
    cb(null, name);
  }
});

function fileFilter(req, file, cb) {
  const ok = (file.mimetype || "").startsWith("image/");
  cb(ok ? null : new Error("Only image files are allowed"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

// -------- Admin: upload (✅ محمي) --------
app.post("/api/admin/upload", requireAdmin, upload.single("image"), (req, res) => {
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok: true, imageUrl: url });
});

// -------- Public APIs --------
app.get("/api/products", (req, res) => {
  const q = (req.query.q || "").toLowerCase();
  const category = req.query.category || "all";

  let sql = "SELECT * FROM products";
  const params = [];
  const where = [];

  if (q) {
    where.push("(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category !== "all") {
    where.push("category = ?");
    params.push(category);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY id DESC";

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// single product
app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  db.get("SELECT * FROM products WHERE id=?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
});

app.get("/api/categories", (req, res) => {
  db.all("SELECT DISTINCT category FROM products ORDER BY category ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows.map(r => r.category));
  });
});

app.post("/api/orders", (req, res) => {
  const { name, phone, address, notes, items } = req.body;

  if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing order fields" });
  }

  const ids = items.map(x => x.productId).filter(Boolean);
  const placeholders = ids.map(() => "?").join(",");

  db.all(`SELECT * FROM products WHERE id IN (${placeholders})`, ids, (err, products) => {
    if (err) return res.status(500).json({ error: "DB error" });

    let subtotal = 0;
    const detailed = [];

    for (const it of items) {
      const p = products.find(pp => pp.id === it.productId);
      if (!p) return res.status(400).json({ error: "Invalid product" });

      const qty = Math.max(1, Number(it.qty || 1));
      if (p.stock < qty) return res.status(400).json({ error: `Out of stock: ${p.name}` });

      subtotal += p.price * qty;
      detailed.push({ id: p.id, name: p.name, price: p.price, qty });
    }

    const shipping = calcShipping(subtotal);
    const total = subtotal + shipping;
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO orders (customer_name, phone, address, notes, items_json, subtotal, shipping, total, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?)`,
      [name, phone, address, notes || "", JSON.stringify(detailed), subtotal, shipping, total, now],
      function (err2) {
        if (err2) return res.status(500).json({ error: "DB error" });

        const upd = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        for (const d of detailed) upd.run([d.qty, d.id]);
        upd.finalize();

        res.json({ ok: true, orderId: this.lastID, total });
      }
    );
  });
});

// -------- Admin APIs --------
app.get("/api/admin/orders", requireAdmin, (req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.put("/api/admin/orders/:id/status", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body.status || "").toUpperCase();
  const allowed = ["NEW","CONFIRMED","SHIPPED","DONE","CANCELED"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

  db.run("UPDATE orders SET status=? WHERE id=?", [status, id], function(err){
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ ok:true, changed:this.changes });
  });
});

app.post("/api/admin/products", requireAdmin, (req, res) => {
  const { name, price, category, emoji, description, stock, image_url } = req.body;
  if (!name || price == null || !category || !emoji || !description) {
    return res.status(400).json({ error: "Missing product fields" });
  }
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO products (name, price, category, emoji, description, stock, image_url, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, Number(price), category, emoji, description, Number(stock || 0), String(image_url || ""), now],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ ok: true, id: this.lastID });
    }
  );
});

app.put("/api/admin/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { name, price, category, emoji, description, stock, image_url } = req.body;

  db.run(
    `UPDATE products
     SET name=?, price=?, category=?, emoji=?, description=?, stock=?, image_url=?
     WHERE id=?`,
    [name, Number(price), category, emoji, description, Number(stock), String(image_url || ""), id],
    function (err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ ok: true, changed: this.changes });
    }
  );
});

// delete product + delete image file
app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);

  db.get("SELECT image_url FROM products WHERE id=?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const imageUrl = row?.image_url ? String(row.image_url) : "";
    db.run("DELETE FROM products WHERE id=?", [id], function (err2) {
      if (err2) return res.status(500).json({ error: "DB error" });

      if (imageUrl.startsWith("/uploads/")) {
        const filePath = path.join(uploadsDir, imageUrl.replace("/uploads/", ""));
        fs.unlink(filePath, () => {});
      }

      res.json({ ok: true, deleted: this.changes });
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`✅ Products: http://localhost:${PORT}/api/products`);
});
app.get("/", (req, res) => {
  res.send("Perfect Store API is running");
});
