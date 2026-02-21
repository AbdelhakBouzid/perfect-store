import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import crypto from "crypto";
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
const APP_SECRET = process.env.APP_SECRET || "change-this-app-secret";
const AUTH_TTL_HOURS = Number(process.env.AUTH_TTL_HOURS || 24 * 7);

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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string" || !storedHash.includes(":")) return false;
  const [salt, rawHash] = storedHash.split(":");
  if (!salt || !rawHash) return false;

  const computedHash = crypto.scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(rawHash, "hex");
  if (computedHash.length !== hashBuffer.length) return false;
  return crypto.timingSafeEqual(computedHash, hashBuffer);
}

function makeAuthToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    fullName: user.full_name,
    exp: Date.now() + AUTH_TTL_HOURS * 60 * 60 * 1000
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", APP_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "uploads");
const clientDir = path.join(__dirname, "public");
app.use(express.static(clientDir));

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "7d"
  })
);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 8 ? ext : ".jpg";
    const name = `p_${Date.now()}_${Math.random().toString(16).slice(2)}${safeExt}`;
    cb(null, name);
  }
});

function fileFilter(_req, file, cb) {
  const ok = (file.mimetype || "").startsWith("image/");
  cb(ok ? null : new Error("Only image files are allowed"), ok);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.post("/api/auth/register", (req, res) => {
  const fullName = String(req.body.fullName || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "Missing register fields" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const now = new Date().toISOString();
  const passwordHash = hashPassword(password);

  db.run(
    "INSERT INTO users (full_name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
    [fullName, email, passwordHash, now],
    function onRegister(err) {
      if (err) {
        if (String(err.message || "").includes("UNIQUE")) {
          return res.status(409).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "DB error" });
      }

      const user = { id: this.lastID, full_name: fullName, email };
      const token = makeAuthToken(user);
      return res.json({
        ok: true,
        token,
        user: { id: user.id, fullName: user.full_name, email: user.email }
      });
    }
  );
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Missing login fields" });
  }

  db.get(
    "SELECT id, full_name, email, password_hash FROM users WHERE lower(email)=lower(?)",
    [email],
    (err, row) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (!row || !verifyPassword(password, row.password_hash)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = makeAuthToken(row);
      return res.json({
        ok: true,
        token,
        user: { id: row.id, fullName: row.full_name, email: row.email }
      });
    }
  );
});

app.post("/api/admin/upload", requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file || !req.file.filename) {
    return res.status(400).json({ error: "Image upload failed" });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ ok: true, imageUrl: url });
});

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

app.get("/api/products/:id", (req, res) => {
  const id = Number(req.params.id);
  db.get("SELECT * FROM products WHERE id=?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });
});

app.get("/api/categories", (_req, res) => {
  db.all("SELECT DISTINCT category FROM products ORDER BY category ASC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows.map((r) => r.category));
  });
});

app.post("/api/orders", (req, res) => {
  const { name, phone, address, notes, items } = req.body;

  if (!name || !phone || !address || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Missing order fields" });
  }

  const ids = items.map((x) => x.productId).filter(Boolean);
  if (!ids.length) return res.status(400).json({ error: "Missing items" });
  const placeholders = ids.map(() => "?").join(",");

  db.all(`SELECT * FROM products WHERE id IN (${placeholders})`, ids, (err, products) => {
    if (err) return res.status(500).json({ error: "DB error" });

    let subtotal = 0;
    const detailed = [];

    for (const it of items) {
      const p = products.find((pp) => pp.id === it.productId);
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
      function onOrder(err2) {
        if (err2) return res.status(500).json({ error: "DB error" });

        const upd = db.prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        for (const d of detailed) upd.run([d.qty, d.id]);
        upd.finalize();

        res.json({ ok: true, orderId: this.lastID, total });
      }
    );
  });
});

app.get("/api/admin/orders", requireAdmin, (_req, res) => {
  db.all("SELECT * FROM orders ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

app.put("/api/admin/orders/:id/status", requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const status = String(req.body.status || "").toUpperCase();
  const allowed = ["NEW", "CONFIRMED", "SHIPPED", "DONE", "CANCELED"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });

  db.run("UPDATE orders SET status=? WHERE id=?", [status, id], function onStatus(err) {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json({ ok: true, changed: this.changes });
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
    function onCreate(err) {
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
    function onUpdate(err) {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json({ ok: true, changed: this.changes });
    }
  );
});

app.delete("/api/admin/products/:id", requireAdmin, (req, res) => {
  const id = Number(req.params.id);

  db.get("SELECT image_url FROM products WHERE id=?", [id], (err, row) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const imageUrl = row?.image_url ? String(row.image_url) : "";
    db.run("DELETE FROM products WHERE id=?", [id], function onDelete(err2) {
      if (err2) return res.status(500).json({ error: "DB error" });

      if (imageUrl.startsWith("/uploads/")) {
        const filePath = path.join(uploadsDir, imageUrl.replace("/uploads/", ""));
        fs.unlink(filePath, () => {});
      }

      res.json({ ok: true, deleted: this.changes });
    });
  });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) return next();
  res.sendFile(path.join(clientDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Products: http://localhost:${PORT}/api/products`);
});
