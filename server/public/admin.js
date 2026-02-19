const SERVER = (window.APP_CONFIG && window.APP_CONFIG.BACKEND_URL)
  ? window.APP_CONFIG.BACKEND_URL
  : "http://localhost:5000";
const API = `${SERVER}/api`;

const TOKEN_KEY = "ps_admin_token_v1";

const tokenEl = document.getElementById("token");
const saveTokenBtn = document.getElementById("saveToken");

const form = document.getElementById("productForm");
const idEl = document.getElementById("id");
const imageUrlEl = document.getElementById("image_url");

const nameEl = document.getElementById("name");
const priceEl = document.getElementById("price");
const categoryEl = document.getElementById("category");
const emojiEl = document.getElementById("emoji");
const stockEl = document.getElementById("stock");
const descEl = document.getElementById("description");

const imageFileEl = document.getElementById("imageFile");
const imagePreviewEl = document.getElementById("imagePreview");

const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const searchEl = document.getElementById("search");

const cancelEditBtn = document.getElementById("cancelEdit");
const refreshListBtn = document.getElementById("refreshList");

const loadOrdersBtn = document.getElementById("loadOrders");
const ordersEl = document.getElementById("orders");

const toastEl = document.getElementById("toast");

// ✅ آمن: ماكاين حتى توكن default كيبان
tokenEl.value = localStorage.getItem(TOKEN_KEY) || "";

saveTokenBtn.addEventListener("click", () => {
  localStorage.setItem(TOKEN_KEY, tokenEl.value.trim() || "");
  toast("Token saved ✅");
});

imageFileEl.addEventListener("change", async () => {
  const file = imageFileEl.files && imageFileEl.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    toast("Image is too large (max 2MB) ⚠️");
    imageFileEl.value = "";
    return;
  }

  const dataUrl = await fileToDataUrl(file);
  showPreview(dataUrl);
});

cancelEditBtn.addEventListener("click", () => {
  clearForm();
  toast("Edit canceled");
});

refreshListBtn.addEventListener("click", async () => {
  await loadAndRenderProducts();
  toast("Products refreshed ✅");
});

searchEl.addEventListener("input", () => renderProducts(window.__productsCache || []));

loadOrdersBtn.addEventListener("click", loadOrders);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = getToken();
  if (!token) return toast("Enter admin token first ⚠️");

  // upload image if selected
  let image_url = imageUrlEl.value || "";
  const file = imageFileEl.files && imageFileEl.files[0];

  if (file) {
    try {
      image_url = await uploadImage(file, token);
    } catch {
      return toast("Upload failed ❌");
    }
  }

  const payload = {
    name: nameEl.value.trim(),
    price: Number(priceEl.value),
    category: categoryEl.value.trim(),
    emoji: (emojiEl.value.trim() || "📦"),
    description: descEl.value.trim(),
    stock: Number(stockEl.value),
    image_url
  };

  if (!payload.name || !payload.category || !payload.description || isNaN(payload.price) || isNaN(payload.stock)) {
    return toast("Please complete required fields ⚠️");
  }

  try {
    if (idEl.value) {
      await apiUpdateProduct(Number(idEl.value), payload, token);
      toast("Product updated ✅");
    } else {
      await apiCreateProduct(payload, token);
      toast("Product added ✅");
    }
  } catch {
    return toast("Save failed ❌ (check token/server)");
  }

  clearForm();
  await loadAndRenderProducts();
});

(async function boot() {
  await loadAndRenderProducts();
})();

function getToken() {
  return (localStorage.getItem(TOKEN_KEY) || "").trim();
}

async function loadAndRenderProducts() {
  const res = await fetch(`${API}/products`);
  const data = await res.json();
  window.__productsCache = Array.isArray(data) ? data : [];
  renderProducts(window.__productsCache);
}

function renderProducts(list) {
  const q = searchEl.value.trim().toLowerCase();
  const filtered = list.filter(p => {
    const text = (p.name + " " + p.category + " " + p.description).toLowerCase();
    return !q || text.includes(q);
  });

  emptyEl.hidden = filtered.length !== 0;

  listEl.innerHTML = filtered.map(p => {
    const img = p.image_url ? `${SERVER}${p.image_url}` : "";
    const inStock = Number(p.stock) > 0;
    return `
      <div class="row-item">
        <div>
          ${img
            ? `<img class="p-thumb" src="${img}" alt="${escapeHtml(p.name)}" />`
            : `<div class="p-thumb" style="display:grid;place-items:center;font-size:32px;">${escapeHtml(p.emoji || "📦")}</div>`}
        </div>
        <div>
          <div class="itemName">${escapeHtml(p.name)}</div>
          <div class="itemMeta">${escapeHtml(p.description || "No description")}</div>
          <div class="itemMeta">${escapeHtml(p.category)} • #${Number(p.id)}</div>
        </div>
        <div><strong>$${Number(p.price).toFixed(2)}</strong></div>
        <div>${Number(p.stock)}</div>
        <div><span class="pill ${inStock ? "ok" : "bad"}">${inStock ? "Active" : "Out"}</span></div>
        <div class="itemActions">
          <button class="btn primary" data-edit="${Number(p.id)}">Edit</button>
          <button class="btn ghost" data-del="${Number(p.id)}">Delete</button>
        </div>
      </div>
    `;
  }).join("");

  listEl.querySelectorAll("[data-edit]").forEach(b => {
    b.addEventListener("click", () => {
      const id = Number(b.dataset.edit);
      const p = (window.__productsCache || []).find(x => Number(x.id) === id);
      if (p) startEdit(p);
    });
  });

  listEl.querySelectorAll("[data-del]").forEach(b => {
    b.addEventListener("click", async () => {
      const token = getToken();
      if (!token) return toast("Enter admin token ⚠️");
      const id = Number(b.dataset.del);
      try {
        await apiDeleteProduct(id, token);
        toast("Product deleted ✅");
        await loadAndRenderProducts();
      } catch {
        toast("Delete failed ❌");
      }
    });
  });
}

function startEdit(p) {
  idEl.value = Number(p.id);
  nameEl.value = p.name || "";
  priceEl.value = Number(p.price || 0);
  categoryEl.value = p.category || "";
  emojiEl.value = p.emoji || "📦";
  stockEl.value = Number(p.stock || 0);
  descEl.value = p.description || "";
  imageUrlEl.value = p.image_url || "";

  if (p.image_url) showPreview(`${SERVER}${p.image_url}`);
  else clearPreview();

  imageFileEl.value = "";
  toast("Editing product ✍️");
}

function clearForm() {
  idEl.value = "";
  imageUrlEl.value = "";
  nameEl.value = "";
  priceEl.value = "";
  categoryEl.value = "";
  emojiEl.value = "";
  stockEl.value = "";
  descEl.value = "";
  imageFileEl.value = "";
  clearPreview();
}

async function uploadImage(file, token) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch(`${API}/admin/upload`, {
    method: "POST",
    headers: { "x-admin-token": token },
    body: fd
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.imageUrl;
}

async function apiCreateProduct(payload, token) {
  const res = await fetch(`${API}/admin/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Create failed");
  return data;
}

async function apiUpdateProduct(id, payload, token) {
  const res = await fetch(`${API}/admin/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Update failed");
  return data;
}

async function apiDeleteProduct(id, token) {
  const res = await fetch(`${API}/admin/products/${id}`, {
    method: "DELETE",
    headers: { "x-admin-token": token }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
  return data;
}

/* -------- Orders dashboard -------- */
async function loadOrders() {
  const token = getToken();
  if (!token) return toast("Enter admin token ⚠️");

  try {
    const res = await fetch(`${API}/admin/orders`, { headers: { "x-admin-token": token } });
    const data = await res.json();
    if (!res.ok) return toast("Failed loading orders ❌");

    ordersEl.innerHTML = (data || []).map(o => {
      const phone = String(o.phone || "").replace(/\s+/g, "");
      const wa = phone ? `https://wa.me/${phone.replace(/^0/, "212")}` : "";

      return `
        <div class="item">
          <div class="itemTop">
            <div>
              <div class="itemName">Order #${o.id} <span class="pill">${escapeHtml(o.status)}</span></div>
              <div class="itemMeta">${escapeHtml(o.customer_name)} • ${escapeHtml(o.phone)}</div>
              <div class="itemMeta">${escapeHtml(o.address)}</div>
              ${o.notes ? `<div class="itemMeta">Notes: ${escapeHtml(o.notes)}</div>` : ""}
            </div>
            <div style="font-weight:900;">${Number(o.total)} MAD</div>
          </div>

          <div class="itemActions">
            ${wa ? `<a class="btn primary" target="_blank" href="${wa}">WhatsApp</a>` : ""}
            <button class="btn ghost" data-st="CONFIRMED" data-oid="${o.id}">CONFIRMED</button>
            <button class="btn ghost" data-st="SHIPPED" data-oid="${o.id}">SHIPPED</button>
            <button class="btn ghost" data-st="DONE" data-oid="${o.id}">DONE</button>
            <button class="btn ghost" data-st="CANCELED" data-oid="${o.id}">CANCELED</button>
          </div>

          <div class="itemMeta" style="margin-top:8px; white-space:pre-wrap;">Items: ${escapeHtml(o.items_json)}</div>
        </div>
      `;
    }).join("");

    ordersEl.querySelectorAll("[data-oid]").forEach(btn => {
      btn.addEventListener("click", async () => {
        const oid = Number(btn.dataset.oid);
        const st = String(btn.dataset.st);
        try {
          await updateOrderStatus(oid, st, token);
          toast(`Order #${oid} updated ✅`);
          await loadOrders();
        } catch {
          toast("Failed updating status ❌");
        }
      });
    });

    toast("Orders loaded ✅");
  } catch {
    toast("Server connection error ❌");
  }
}

async function updateOrderStatus(id, status, token) {
  const res = await fetch(`${API}/admin/orders/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-token": token },
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Status update failed");
  return data;
}

/* -------- Preview helpers -------- */
function showPreview(src) {
  imagePreviewEl.src = src;
  imagePreviewEl.style.display = "block";
}
function clearPreview() {
  imagePreviewEl.src = "";
  imagePreviewEl.style.display = "none";
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* -------- Toast + escape -------- */
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.hidden = true, 2300);
}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
