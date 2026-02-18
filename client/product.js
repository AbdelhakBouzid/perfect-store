const SERVER = (window.APP_CONFIG && window.APP_CONFIG.BACKEND_URL) ? window.APP_CONFIG.BACKEND_URL : "http://localhost:5000";
const API = `${SERVER}/api`;
const CART_KEY = "ps_cart_store_v1";

const $ = (id) => document.getElementById(id);

const pwrap = $("pwrap");
const loading = $("loading");

const pname = $("pname");
const pdesc = $("pdesc");
const pcat = $("pcat");
const pstock = $("pstock");
const pprice = $("pprice");
const pimg = $("pimg");
const addBtn = $("addBtn");
const related = $("related");

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
const toastEl = $("toast");

let cart = loadCart();
let product = null;
let products = [];

init();

async function init(){
  bindCartUI();
  renderCartBadge();
  renderCart();

  const id = Number(new URLSearchParams(location.search).get("id") || 0);
  if (!id) return showError("ID ديال المنتج ناقص");

  try{
    // products list (for related)
    const allRes = await fetch(`${API}/products`);
    products = await allRes.json();

    // single product
    const res = await fetch(`${API}/products/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Product not found");
    product = data;

    renderProduct();
    renderRelated();
  } catch(e){
    showError("ماقدرناش نحملو المنتج");
  }
}

function bindCartUI(){
  openCartBtn.addEventListener("click", openCart);
  closeCartBtn.addEventListener("click", ()=>closeCart(true));
  backdrop.addEventListener("click", ()=>closeCart(true));
  window.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeCart(true); });

  clearBtn.addEventListener("click", ()=>{
    cart = {};
    saveCart();
    renderCartBadge();
    renderCart();
    toast("تم تفريغ السلة ✅");
  });
}

function renderProduct(){
  loading.hidden = true;
  pwrap.hidden = false;

  const img = product.image_url ? `${SERVER}${product.image_url}` : "";
  pimg.src = img || "";
  pimg.style.display = img ? "block" : "none";
  if(!img){
    pimg.alt = "no image";
    // fallback: نخلي بلا صورة (CSS كيغطيها)
  }

  pname.textContent = product.name;
  pdesc.textContent = product.description || "";
  pcat.textContent = product.category || "";
  const out = Number(product.stock) <= 0;
  pstock.textContent = out ? "نفذ المخزون" : `متوفر: ${Number(product.stock)}`;
  pprice.textContent = `${money(Number(product.price))} MAD`;

  addBtn.disabled = out;
  addBtn.textContent = out ? "غير متوفر" : "أضف للسلة";
  addBtn.onclick = ()=>{
    cart[product.id] = (cart[product.id] || 0) + 1;
    saveCart();
    renderCartBadge();
    renderCart();
    openCart();
    toast("تمت الإضافة للسلة ✅");
  };
}

function renderRelated(){
  if(!products.length) return;
  const same = products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 6);

  related.innerHTML = same.map(p=>{
    const img = p.image_url ? `${SERVER}${p.image_url}` : "";
    return `
      <article class="card" style="min-height:260px;">
        <div class="thumb">
          ${
            img
              ? `<img src="${img}" alt="${escapeHtml(p.name)}" />`
              : `<div class="fallback">${escapeHtml(p.emoji || "📦")}</div>`
          }
        </div>
        <div class="card-body">
          <h3 style="margin:0;">${escapeHtml(p.name)}</h3>
          <div class="price-row">
            <div class="price">${money(Number(p.price))} MAD</div>
            <a class="btn ghost" href="./product.html?id=${Number(p.id)}">عرض</a>
          </div>
        </div>
      </article>
    `;
  }).join("") || `<div class="muted small">ماكاينش منتجات مشابهة دابا.</div>`;
}

/* ---------------- Cart render ---------------- */
function loadCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function getCartCount(){ return Object.values(cart).reduce((a,b)=>a+b,0); }
function money(n){ return Math.round(n*100)/100; }

function renderCartBadge(){ countEl.textContent = String(getCartCount()); }

function getCartLines(){
  const lines = [];
  for (const [idStr, qty] of Object.entries(cart)){
    const id = Number(idStr);
    const p = products.find(x=>Number(x.id)===id);
    if(!p) continue;
    lines.push({ id, qty, p });
  }
  return lines;
}
function calcTotals(lines){
  const subtotal = lines.reduce((s,x)=>s+Number(x.p.price)*x.qty,0);
  const shipping = subtotal<=0 ? 0 : (subtotal>=600 ? 0 : 39);
  return { subtotal, shipping, total: subtotal+shipping };
}

function renderCart(){
  const lines = getCartLines();
  cartHint.textContent = lines.length ? `عدد العناصر: ${getCartCount()}` : "السلة فارغة";

  if(!lines.length){
    itemsEl.innerHTML = `<div class="muted">السلة فارغة…</div>`;
  } else {
    itemsEl.innerHTML = lines.map(x=>{
      const img = x.p.image_url ? `${SERVER}${x.p.image_url}` : "";
      return `
        <div class="item">
          <div class="item-top">
            <div style="display:flex; gap:10px; align-items:center;">
              <div class="cartthumb">
                ${img ? `<img src="${img}" alt="" />` : `<div class="cartthumbFallback">${escapeHtml(x.p.emoji || "📦")}</div>`}
              </div>
              <div>
                <div class="item-name">${escapeHtml(x.p.name)}</div>
                <div class="small muted">سعر الوحدة: ${money(Number(x.p.price))} MAD</div>
              </div>
            </div>
            <div><b>${money(Number(x.p.price)*x.qty)} MAD</b></div>
          </div>
          <div class="qty">
            <button data-dec="${x.id}">−</button>
            <b>${x.qty}</b>
            <button data-inc="${x.id}">+</button>
            <button class="btn ghost remove" data-rem="${x.id}">حذف</button>
          </div>
        </div>
      `;
    }).join("");

    itemsEl.querySelectorAll("[data-inc]").forEach(b=>b.addEventListener("click",()=>changeQty(b.dataset.inc, +1)));
    itemsEl.querySelectorAll("[data-dec]").forEach(b=>b.addEventListener("click",()=>changeQty(b.dataset.dec, -1)));
    itemsEl.querySelectorAll("[data-rem]").forEach(b=>b.addEventListener("click",()=>removeItem(b.dataset.rem)));
  }

  const t = calcTotals(lines);
  subtotalEl.textContent = money(t.subtotal);
  shippingEl.textContent = money(t.shipping);
  totalEl.textContent = money(t.total);
}

function changeQty(id, delta){
  id = Number(id);
  const next = (cart[id] || 0) + delta;
  if(next<=0) delete cart[id]; else cart[id]=next;
  saveCart(); renderCartBadge(); renderCart();
}
function removeItem(id){
  delete cart[Number(id)];
  saveCart(); renderCartBadge(); renderCart();
  toast("تم حذف العنصر ✅");
}

/* ---------------- Drawer ---------------- */
function openCart(){ cartEl.classList.add("open"); backdrop.hidden=false; }
function closeCart(force=true){ cartEl.classList.remove("open"); if(force) backdrop.hidden=true; }

/* ---------------- Utils ---------------- */
let toastTimer=null;
function toast(msg){
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toastEl.hidden=true, 2200);
}
function showError(msg){
  loading.hidden = false;
  loading.innerHTML = `<b>❌ ${escapeHtml(msg)}</b><div class="muted small" style="margin-top:6px;">رجع للمتجر وجرب من جديد</div>`;
}
function escapeHtml(str){
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
