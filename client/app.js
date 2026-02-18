// client/app.js (FIXED - checkout modal always closes)
const SERVER = (window.APP_CONFIG && window.APP_CONFIG.BACKEND_URL) ? window.APP_CONFIG.BACKEND_URL : "http://localhost:5000";
const API = `${SERVER}/api`;
const CART_KEY = "ps_cart_store_v1";

const $ = (id) => document.getElementById(id);
const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };

const grid = $("grid");
const emptyState = $("emptyState");
const q = $("q");
const cat = $("cat");
const sort = $("sort");
const refreshBtn = $("refresh");
const resultInfo = $("resultInfo");
const kpiProducts = $("kpiProducts");
const modeInfo = $("modeInfo");

const cartEl = $("cart");
const openCartBtn = $("openCart");
const closeCartBtn = $("closeCart");
const backdrop = $("backdrop");

const itemsEl = $("items");
const countEl = $("count");
const subtotalEl = $("subtotal");
const shippingEl = $("shipping");
const totalEl = $("total");
const cartHint = $("cartHint");

const clearBtn = $("clear");
const openCheckoutBtn = $("openCheckout");

const checkoutModal = $("checkout");
const closeCheckoutBtn = $("closeCheckout");
const cancelCheckoutBtn = $("cancelCheckout");
const checkoutBtn = $("checkoutBtn");

const nameEl = $("name");
const phoneEl = $("phone");
const addressEl = $("address");
const notesEl = $("notes");

const toastEl = $("toast");

let products = [];
let cart = loadCart();

init();

async function init() {
  bindUI();
  await loadCategories();
  await loadProducts();
  renderAll();
  toast("مرحبا 👋");
}

function bindUI() {
  on(openCartBtn, "click", openCart);
  on(closeCartBtn, "click", () => closeCart(true));

  // backdrop click closes everything
  on(backdrop, "click", () => {
    forceCloseCheckout();
    closeCart(true);
  });

  // ESC closes everything
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      forceCloseCheckout();
      closeCart(true);
    }
  });

  on(clearBtn, "click", () => {
    cart = {};
    saveCart();
    renderCartBadge();
    renderCart();
    toast("تم تفريغ السلة ✅");
  });

  on(openCheckoutBtn, "click", () => {
    if (getCartCount() === 0) return toast("السلة فارغة 🛒");
    openCheckout();
  });

  // ✅ Defensive close handlers (won't crash if button missing)
  on(closeCheckoutBtn, "click", forceCloseCheckout);
  on(cancelCheckoutBtn, "click", forceCloseCheckout);

  // ✅ Extra: if IDs differ, clicking any button inside checkout that looks like close will close it
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      const t = e.target;
      const btn = t && t.closest ? t.closest("button") : null;
      if (!btn) return;

      const txt = (btn.textContent || "").trim();
      const isClose =
        btn.id === "closeCheckout" ||
        btn.id === "cancelCheckout" ||
        txt === "✕" ||
        txt.includes("إلغاء") ||
        txt.includes("الغاء") ||
        txt.includes("Cancel");

      if (isClose) forceCloseCheckout();
    });
  }

  on(checkoutBtn, "click", placeOrder);

  on(q, "input", debounce(async () => {
    await loadProducts();
    renderAll();
  }, 220));

  on(cat, "change", async () => {
    await loadProducts();
    renderAll();
  });

  on(sort, "change", renderProducts);

  on(refreshBtn, "click", async () => {
    await loadCategories();
    await loadProducts();
    renderAll();
    toast("تحديث ✅");
  });
}

// ---------- API ----------
async function loadCategories() {
  try {
    const res = await fetch(`${API}/categories`);
    const cats = await res.json();
    if (cat) {
      cat.innerHTML =
        `<option value="all">كل الأصناف</option>` +
        (cats || []).map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    }
    if (modeInfo) modeInfo.textContent = "Mode: API (server)";
  } catch {
    if (cat) cat.innerHTML = `<option value="all">كل الأصناف</option>`;
    if (modeInfo) modeInfo.textContent = "Mode: API (server) (categories failed)";
  }
}

async function loadProducts() {
  const params = new URLSearchParams();
  if (q && q.value.trim()) params.set("q", q.value.trim());
  if (cat && cat.value && cat.value !== "all") params.set("category", cat.value);

  const res = await fetch(`${API}/products?${params.toString()}`);
  products = await res.json();
}

// ---------- Rendering ----------
function renderAll() {
  if (kpiProducts) kpiProducts.textContent = String(products.length);
  renderProducts();
  renderCartBadge();
  renderCart();
}

function renderProducts() {
  if (!grid) return;

  let list = [...products];

  const s = sort ? sort.value : "featured";
  if (s === "priceAsc") list.sort((a, b) => a.price - b.price);
  if (s === "priceDesc") list.sort((a, b) => b.price - a.price);
  if (s === "nameAsc") list.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  if (resultInfo) resultInfo.textContent = `عدد النتائج: ${list.length}`;

  if (list.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    return;
  }
  if (emptyState) emptyState.hidden = true;

  grid.innerHTML = list.map(p => {
    const out = Number(p.stock) <= 0;
    const img = p.image_url ? `${SERVER}${p.image_url}` : "";
    return `
      <article class="card">
        <div class="thumb">
          ${
            img
              ? `<img src="${img}" alt="${escapeHtml(p.name)}" />`
              : `<div class="fallback">${escapeHtml(p.emoji || "📦")}</div>`
          }
        </div>
        <div class="card-body">
          <div class="meta">
            <span class="pill">${escapeHtml(p.category || "")}</span>
            <span class="pill ${out ? "out" : ""}">${out ? "نفذ المخزون" : "متوفر: " + Number(p.stock)}</span>
          </div>
          <h3><a class="plink" href="./product.html?id=${Number(p.id)}">${escapeHtml(p.name)}</a></h3>
          <p class="desc">${escapeHtml(p.description || "")}</p>
          <div class="price-row">
            <div class="price">${money(Number(p.price))} MAD</div>
            <button class="btn primary" data-add="${Number(p.id)}" ${out ? "disabled" : ""}>أضف للسلة</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-add]").forEach(b => {
    b.addEventListener("click", () => {
      const id = Number(b.dataset.add);
      cart[id] = (cart[id] || 0) + 1;
      saveCart();
      renderCartBadge();
      renderCart();
      openCart();
      toast("تمت الإضافة للسلة ✅");
    });
  });
}

// ---------- Cart ----------
function loadCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
}
function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function getCartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}
function money(n) {
  return Math.round(n * 100) / 100;
}

function renderCartBadge() {
  if (countEl) countEl.textContent = String(getCartCount());
}

function getCartLines() {
  const lines = [];
  for (const [idStr, qty] of Object.entries(cart)) {
    const id = Number(idStr);
    const p = products.find(x => Number(x.id) === id);
    if (!p) continue;
    lines.push({ id, qty, p });
  }
  return lines;
}

function calcTotals(lines) {
  const subtotal = lines.reduce((s, x) => s + Number(x.p.price) * x.qty, 0);
  const shipping = subtotal <= 0 ? 0 : (subtotal >= 600 ? 0 : 39);
  return { subtotal, shipping, total: subtotal + shipping };
}

function renderCart() {
  if (!itemsEl) return;

  const lines = getCartLines();
  if (cartHint) cartHint.textContent = lines.length ? `عدد العناصر: ${getCartCount()}` : "السلة فارغة";

  if (!lines.length) {
    itemsEl.innerHTML = `<div class="muted">السلة فارغة… زيد شي منتوج 😊</div>`;
  } else {
    itemsEl.innerHTML = lines.map(x => `
      <div class="item">
        <div class="item-top">
          <div>
            <div class="item-name">${escapeHtml(x.p.emoji || "📦")} ${escapeHtml(x.p.name)}</div>
            <div class="small muted item-sub">سعر الوحدة: ${money(Number(x.p.price))} MAD</div>
          </div>
          <div><b>${money(Number(x.p.price) * x.qty)} MAD</b></div>
        </div>
        <div class="qty">
          <button data-dec="${x.id}">−</button>
          <b>${x.qty}</b>
          <button data-inc="${x.id}">+</button>
          <button class="btn ghost remove" data-rem="${x.id}">حذف</button>
        </div>
      </div>
    `).join("");

    itemsEl.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.inc, +1)));
    itemsEl.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.dec, -1)));
    itemsEl.querySelectorAll("[data-rem]").forEach(b => b.addEventListener("click", () => removeItem(b.dataset.rem)));
  }

  const t = calcTotals(lines);
  if (subtotalEl) subtotalEl.textContent = money(t.subtotal);
  if (shippingEl) shippingEl.textContent = money(t.shipping);
  if (totalEl) totalEl.textContent = money(t.total);
}

function changeQty(id, delta) {
  id = Number(id);
  const next = (cart[id] || 0) + delta;
  if (next <= 0) delete cart[id];
  else cart[id] = next;
  saveCart();
  renderCartBadge();
  renderCart();
}

function removeItem(id) {
  delete cart[Number(id)];
  saveCart();
  renderCartBadge();
  renderCart();
  toast("تم حذف العنصر ✅");
}

// ---------- Drawer / Modal ----------
function showBackdrop() { if (backdrop) backdrop.hidden = false; }
function hideBackdrop() { if (backdrop) backdrop.hidden = true; }

function openCart() {
  if (!cartEl) return;
  cartEl.classList.add("open");
  cartEl.setAttribute("aria-hidden", "false");
  showBackdrop();
}

function closeCart(force = false) {
  if (!cartEl) return;
  cartEl.classList.remove("open");
  cartEl.setAttribute("aria-hidden", "true");
  if (force && !isCheckoutOpen()) hideBackdrop();
  if (!force && !isCheckoutOpen()) hideBackdrop();
}

function openCheckout() {
  if (!checkoutModal) return;
  checkoutModal.hidden = false;
  checkoutModal.style.display = "grid";
  showBackdrop();
}

// ✅ KILL SWITCH: closes 100% even if CSS is weird
function forceCloseCheckout() {
  if (!checkoutModal) { hideBackdrop(); return; }

  checkoutModal.hidden = true;
  checkoutModal.style.display = "none";
  checkoutModal.setAttribute("aria-hidden", "true");

  // remove any "stuck" inline styles after tick
  setTimeout(() => {
    checkoutModal.style.display = "";
  }, 0);

  // if cart not open, hide backdrop too
  if (!cartEl || !cartEl.classList.contains("open")) hideBackdrop();
}

function isCheckoutOpen() {
  if (!checkoutModal) return false;
  // robust check
  const style = window.getComputedStyle(checkoutModal);
  return !checkoutModal.hidden && style.display !== "none" && style.visibility !== "hidden";
}

// ---------- Place order ----------
async function placeOrder() {
  const lines = getCartLines();
  if (!lines.length) return toast("السلة فارغة 🛒");

  const payload = {
    name: nameEl ? nameEl.value.trim() : "",
    phone: phoneEl ? phoneEl.value.trim() : "",
    address: addressEl ? addressEl.value.trim() : "",
    notes: notesEl ? notesEl.value.trim() : "",
    items: lines.map(x => ({ productId: x.id, qty: x.qty })),
  };

  if (!payload.name || !payload.phone || !payload.address) {
    return toast("عافاك عمّر الاسم والهاتف والعنوان ⚠️");
  }

  try {
    const res = await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error || "وقع مشكل فالطلب ❌");

    toast(`✅ تم إنشاء الطلب #${data.orderId}`);

    cart = {};
    saveCart();
    renderCartBadge();
    renderCart();

    if (nameEl) nameEl.value = "";
    if (phoneEl) phoneEl.value = "";
    if (addressEl) addressEl.value = "";
    if (notesEl) notesEl.value = "";

    forceCloseCheckout();
    closeCart(true);
  } catch {
    toast("مشكل فالاتصال بالسيرفر ❌");
  }
}

// ---------- Toast / utils ----------
let toastTimer = null;
function toast(msg) {
  if (!toastEl) return;
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 2300);
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
