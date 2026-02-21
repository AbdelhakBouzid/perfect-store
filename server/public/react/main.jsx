const { useEffect, useMemo, useState } = React;
const { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useParams } = ReactRouterDOM;

const SERVER = (window.APP_CONFIG && window.APP_CONFIG.BACKEND_URL)
  ? window.APP_CONFIG.BACKEND_URL
  : (["localhost", "127.0.0.1"].includes(window.location.hostname) ? "http://localhost:5000" : window.location.origin);

const API = `${SERVER}/api`;
const CART_KEY = "ps_cart_store_v1";
const ADMIN_TOKEN_KEY = "ps_admin_token_v1";
const USER_TOKEN_KEY = "ps_user_token_v1";
const LANG_KEY = "ps_lang_v1";

function readJsonStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch (_e) {
    return fallbackValue;
  }
}

function money(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

function calcShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= 600 ? 0 : 39;
}

async function requestJson(url, options = {}) {
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch (_e) {
    data = {};
  }
  if (!res.ok) {
    const errorMessage = (data && data.error) ? data.error : `Request failed (${res.status})`;
    throw new Error(errorMessage);
  }
  return data;
}

async function api(path, options = {}) {
  return requestJson(`${API}${path}`, options);
}

function useRouteStylesheet(href) {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-react-style", href);
    document.head.appendChild(link);
    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, [href]);
}

function useToast(timeoutMs = 2300) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(""), timeoutMs);
    return () => clearTimeout(timer);
  }, [message, timeoutMs]);

  return [message, setMessage];
}

function useCart() {
  const [cart, setCart] = useState(() => readJsonStorage(CART_KEY, {}));

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const count = useMemo(
    () => Object.values(cart).reduce((sum, qty) => sum + Number(qty || 0), 0),
    [cart]
  );

  function addItem(id) {
    const productId = Number(id);
    setCart((prev) => {
      const next = { ...prev };
      next[productId] = (Number(next[productId]) || 0) + 1;
      return next;
    });
  }

  function changeQty(id, delta) {
    const productId = Number(id);
    setCart((prev) => {
      const next = { ...prev };
      const current = Number(next[productId]) || 0;
      const updated = current + Number(delta);
      if (updated <= 0) delete next[productId];
      else next[productId] = updated;
      return next;
    });
  }

  function removeItem(id) {
    const productId = Number(id);
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  return { cart, count, addItem, changeQty, removeItem, clearCart, setCart };
}

function getCartLines(cart, products) {
  const productMap = new Map((products || []).map((p) => [Number(p.id), p]));
  return Object.entries(cart)
    .map(([idString, qty]) => {
      const id = Number(idString);
      const product = productMap.get(id);
      if (!product) return null;
      return { id, qty: Number(qty), product };
    })
    .filter(Boolean);
}

function calcTotals(lines) {
  const subtotal = lines.reduce((sum, line) => sum + Number(line.product.price) * line.qty, 0);
  const shipping = calcShipping(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

function StorePage() {
  useRouteStylesheet("/styles.css");
  const cartApi = useCart();
  const [toastMessage, showToast] = useToast();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    document.title = "Perfect Store";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 220);
    return () => clearTimeout(timer);
  }, [query]);

  async function loadCatalog() {
    const data = await api("/products");
    setCatalog(Array.isArray(data) ? data : []);
  }

  async function loadCategories() {
    const data = await api("/categories");
    setCategories(Array.isArray(data) ? data : []);
  }

  async function loadProducts(nextQuery, nextCategory) {
    const params = new URLSearchParams();
    if (nextQuery) params.set("q", nextQuery);
    if (nextCategory && nextCategory !== "all") params.set("category", nextCategory);
    const queryString = params.toString();
    const data = await api(`/products${queryString ? `?${queryString}` : ""}`);
    setProducts(Array.isArray(data) ? data : []);
  }

  async function refresh() {
    setLoading(true);
    try {
      await Promise.all([
        loadCategories(),
        loadCatalog(),
        loadProducts(debouncedQuery, category)
      ]);
      showToast("Refreshed");
    } catch (err) {
      showToast(err.message || "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([loadCategories(), loadCatalog(), loadProducts("", "all")])
      .catch((err) => {
        if (mounted) showToast(err.message || "Failed to load data");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadProducts(debouncedQuery, category).catch((err) => {
      if (active) showToast(err.message || "Failed to load products");
    });
    return () => {
      active = false;
    };
  }, [debouncedQuery, category]);

  useEffect(() => {
    function onEscape(event) {
      if (event.key === "Escape") {
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
      }
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const productBase = catalog.length ? catalog : products;
  const lines = useMemo(() => getCartLines(cartApi.cart, productBase), [cartApi.cart, productBase]);
  const totals = useMemo(() => calcTotals(lines), [lines]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sort === "priceAsc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "priceDesc") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "nameAsc") list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    return list;
  }, [products, sort]);

  function handleAddToCart(productId) {
    cartApi.addItem(productId);
    setIsCartOpen(true);
    showToast("Added to cart");
  }

  async function placeOrder() {
    if (!lines.length) {
      showToast("Cart is empty");
      return;
    }

    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      showToast("Please fill name, phone and address");
      return;
    }

    const payload = {
      name: checkoutForm.name.trim(),
      phone: checkoutForm.phone.trim(),
      address: checkoutForm.address.trim(),
      notes: checkoutForm.notes.trim(),
      items: lines.map((line) => ({ productId: line.id, qty: line.qty }))
    };

    try {
      const data = await api("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      showToast(`Order #${data.orderId} created`);
      cartApi.clearCart();
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCheckoutForm({ name: "", phone: "", address: "", notes: "" });
      await Promise.all([loadCatalog(), loadProducts(debouncedQuery, category)]);
    } catch (err) {
      showToast(err.message || "Order failed");
    }
  }

  const showBackdrop = isCartOpen || isCheckoutOpen;

  return (
    <>
      <header className="topbar">
        <div className="container topbar-row">
          <div className="mode-pill">Store</div>
          <nav className="nav-links">
            <a href="#" onClick={(e) => e.preventDefault()}>Language</a>
            <Link to="/auth">Sign In</Link>
            <Link to="/auth/register">Register</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-content">
          <h1>Latest <span>Tech and Gadgets</span></h1>
          <p>Find the best deals on electronics</p>
          <div className="hero-meta">
            <span>Mode: API</span>
            <span>Products: <b>{products.length}</b></span>
          </div>
        </div>
      </section>

      <section className="container toolbar">
        <div className="tabs-row">
          <select
            id="cat"
            className="tab-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            id="q"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            id="sort"
            className="select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A to Z</option>
          </select>

          <button id="refresh" className="btn ghost" onClick={refresh}>Refresh</button>
          <button id="openCart" className="btn primary" onClick={() => setIsCartOpen(true)}>
            Cart <span id="count" className="badge">{cartApi.count}</span>
          </button>
        </div>
        <div className="small muted">
          Results: {sortedProducts.length} {loading ? "(loading...)" : ""}
        </div>
      </section>

      <main className="container">
        {sortedProducts.length ? (
          <section id="grid" className="grid">
            {sortedProducts.map((p) => {
              const out = Number(p.stock) <= 0;
              const img = p.image_url ? `${SERVER}${p.image_url}` : "";
              return (
                <article className="card" key={p.id}>
                  <div className="thumb">
                    {img ? (
                      <img src={img} alt={p.name} />
                    ) : (
                      <div className="fallback">{p.emoji || "Item"}</div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="meta">
                      <span className="pill">{p.category || ""}</span>
                      <span className={`pill ${out ? "out" : ""}`}>
                        {out ? "Out of stock" : `In stock: ${Number(p.stock || 0)}`}
                      </span>
                    </div>
                    <h3>
                      <Link className="plink" to={`/product/${Number(p.id)}`}>{p.name}</Link>
                    </h3>
                    <p className="desc">{p.description || ""}</p>
                    <div className="price-row">
                      <div className="price">{money(p.price)} MAD</div>
                      <button
                        className="btn primary"
                        onClick={() => handleAddToCart(p.id)}
                        disabled={out}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div id="emptyState" className="empty">
            <div className="empty-emoji">No Results</div>
            <div className="empty-title">No products found</div>
            <div className="empty-sub">Change category or search query.</div>
          </div>
        )}
      </main>

      <aside id="cart" className={`drawer ${isCartOpen ? "open" : ""}`} aria-hidden={!isCartOpen}>
        <div className="drawer-head">
          <div>
            <div className="drawer-title">Shopping Cart</div>
            <div className="small muted">{lines.length ? `Items: ${cartApi.count}` : "Cart is empty"}</div>
          </div>
          <button id="closeCart" className="btn ghost" onClick={() => setIsCartOpen(false)}>X</button>
        </div>

        <div id="items" className="drawer-body">
          {!lines.length ? (
            <div className="muted">Your cart is empty.</div>
          ) : (
            lines.map((line) => (
              <div className="item" key={line.id}>
                <div className="item-top">
                  <div>
                    <div className="item-name">{line.product.emoji || "Item"} {line.product.name}</div>
                    <div className="small muted item-sub">Unit price: {money(line.product.price)} MAD</div>
                  </div>
                  <div><b>{money(Number(line.product.price) * line.qty)} MAD</b></div>
                </div>
                <div className="qty">
                  <button onClick={() => cartApi.changeQty(line.id, -1)}>-</button>
                  <b>{line.qty}</b>
                  <button onClick={() => cartApi.changeQty(line.id, 1)}>+</button>
                  <button className="btn ghost remove" onClick={() => cartApi.removeItem(line.id)}>Remove</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer-foot">
          <div className="totals">
            <div className="row"><span>Subtotal</span><b>{money(totals.subtotal)}</b> <span className="muted">MAD</span></div>
            <div className="row"><span>Shipping</span><b>{money(totals.shipping)}</b> <span className="muted">MAD</span></div>
            <div className="row total"><span>Total</span><b>{money(totals.total)}</b> <span className="muted">MAD</span></div>
          </div>
          <button
            id="openCheckout"
            className="btn primary"
            onClick={() => {
              if (!lines.length) {
                showToast("Cart is empty");
                return;
              }
              setIsCheckoutOpen(true);
            }}
          >
            Checkout
          </button>
          <button id="clear" className="btn ghost" onClick={() => cartApi.clearCart()}>Clear Cart</button>
          <div className="small muted">Cash on delivery.</div>
        </div>
      </aside>

      <div
        id="backdrop"
        className="backdrop"
        hidden={!showBackdrop}
        onClick={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
        }}
      />

      <section id="checkout" className="modal" hidden={!isCheckoutOpen}>
        <div className="modal-card">
          <div className="modal-head">
            <div>
              <div className="modal-title">Checkout</div>
              <div className="small muted">Fill the form and confirm your order.</div>
            </div>
            <button id="closeCheckout" className="btn ghost" onClick={() => setIsCheckoutOpen(false)}>X</button>
          </div>

          <div className="modal-body">
            <div className="form-row">
              <label>
                Full Name
                <input
                  id="name"
                  placeholder="John Doe"
                  value={checkoutForm.name}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </label>
              <label>
                Phone
                <input
                  id="phone"
                  placeholder="+212..."
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </label>
            </div>

            <label>
              Address
              <input
                id="address"
                placeholder="City / Street..."
                value={checkoutForm.address}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, address: e.target.value }))}
              />
            </label>

            <label>
              Notes (optional)
              <textarea
                id="notes"
                placeholder="Color / size / time..."
                value={checkoutForm.notes}
                onChange={(e) => setCheckoutForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </label>

            <div className="modal-foot">
              <button id="checkoutBtn" className="btn primary" onClick={placeOrder}>Confirm Order</button>
              <button id="cancelCheckout" className="btn ghost" onClick={() => setIsCheckoutOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </section>

      <Toast message={toastMessage} />
    </>
  );
}

function ProductPage() {
  useRouteStylesheet("/styles.css");
  const { id } = useParams();
  const productId = Number(id || 0);
  const cartApi = useCart();
  const [toastMessage, showToast] = useToast();

  const [product, setProduct] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([api("/products"), api(`/products/${productId}`)])
      .then(([allProducts, single]) => {
        if (!active) return;
        setCatalog(Array.isArray(allProducts) ? allProducts : []);
        setProduct(single || null);
        document.title = single ? `${single.name} - Perfect Store` : "Product - Perfect Store";
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "Failed to load product");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [productId]);

  useEffect(() => {
    function onEscape(event) {
      if (event.key === "Escape") setIsCartOpen(false);
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const lines = useMemo(() => getCartLines(cartApi.cart, catalog), [cartApi.cart, catalog]);
  const totals = useMemo(() => calcTotals(lines), [lines]);
  const related = useMemo(() => {
    if (!product) return [];
    return catalog
      .filter((item) => Number(item.id) !== Number(product.id) && item.category === product.category)
      .slice(0, 6);
  }, [catalog, product]);

  function addCurrentProduct() {
    if (!product) return;
    if (Number(product.stock || 0) <= 0) return;
    cartApi.addItem(product.id);
    setIsCartOpen(true);
    showToast("Added to cart");
  }

  return (
    <>
      <style>
        {`
          .brand { display:flex; gap:10px; align-items:center; }
          .logo { width:40px; height:40px; border-radius:999px; display:grid; place-items:center; background:#13264d; border:1px solid #2f426d; }
          .brand-name { font-weight:800; }
          .brand-sub { font-size:13px; color:#9ba9c9; }
          .actions { display:flex; gap:10px; align-items:center; }
          .pwrap { display:grid; grid-template-columns: 1.1fr 1fr; gap:18px; align-items:start; }
          .pimg { border:1px solid #2a3d67; border-radius:14px; overflow:hidden; background:#081327; min-height:360px; display:grid; place-items:center; }
          .pimg img { width:100%; height:100%; object-fit:cover; display:block; }
          .pinfo .desc { font-size:14px; min-height:auto; }
          .cartthumb { width:56px; height:44px; border-radius:8px; overflow:hidden; border:1px solid #2a3d67; background:#081327; display:grid; place-items:center; }
          .cartthumb img { width:100%; height:100%; object-fit:cover; display:block; }
          .cartthumbFallback { font-size:18px; }
          @media (max-width: 940px) {
            .pwrap { grid-template-columns: 1fr; }
            .actions { flex-wrap: wrap; justify-content: flex-end; }
          }
        `}
      </style>

      <header className="topbar">
        <div className="container topbar-row">
          <div className="brand">
            <div className="logo">PS</div>
            <div>
              <div className="brand-name">Perfect Store</div>
              <div className="brand-sub">Product Page</div>
            </div>
          </div>
          <div className="actions">
            <Link className="btn ghost" to="/">Back to Store</Link>
            <button id="openCart" className="btn primary" onClick={() => setIsCartOpen(true)}>
              Cart <span id="count" className="badge">{cartApi.count}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "18px 0 40px" }}>
        {loading ? (
          <section className="card" style={{ padding: 18 }}>
            <b>Loading...</b>
            <div className="muted small" style={{ marginTop: 6 }}>Loading product details</div>
          </section>
        ) : error ? (
          <section className="card" style={{ padding: 18 }}>
            <b>{error}</b>
            <div className="muted small" style={{ marginTop: 6 }}>
              <Link to="/">Return to store</Link>
            </div>
          </section>
        ) : product ? (
          <section className="pwrap">
            <div className="pimg">
              {product.image_url ? (
                <img src={`${SERVER}${product.image_url}`} alt={product.name} />
              ) : (
                <div className="fallback">{product.emoji || "Item"}</div>
              )}
            </div>

            <div className="pinfo">
              <div className="meta" style={{ marginBottom: 10 }}>
                <span className="pill">{product.category || ""}</span>
                <span className={`pill ${Number(product.stock) <= 0 ? "out" : ""}`}>
                  {Number(product.stock) <= 0 ? "Out of stock" : `In stock: ${Number(product.stock || 0)}`}
                </span>
              </div>

              <h1 style={{ margin: "0 0 10px", fontSize: 28 }}>{product.name}</h1>
              <p className="desc">{product.description || ""}</p>

              <div className="price-row" style={{ marginTop: 14 }}>
                <div className="price" style={{ fontSize: 20 }}>{money(product.price)} MAD</div>
                <button
                  id="addBtn"
                  className="btn primary"
                  disabled={Number(product.stock || 0) <= 0}
                  onClick={addCurrentProduct}
                >
                  {Number(product.stock || 0) <= 0 ? "Unavailable" : "Add to Cart"}
                </button>
              </div>

              <div className="small muted" style={{ marginTop: 10 }}>
                Cash on delivery. Free shipping for orders over 600 MAD.
              </div>

              <div style={{ marginTop: 18 }}>
                <h3 style={{ margin: "0 0 10px" }}>Related Products</h3>
                <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)", padding: 0 }}>
                  {related.length ? related.map((item) => (
                    <article className="card" key={item.id} style={{ minHeight: 260 }}>
                      <div className="thumb">
                        {item.image_url ? (
                          <img src={`${SERVER}${item.image_url}`} alt={item.name} />
                        ) : (
                          <div className="fallback">{item.emoji || "Item"}</div>
                        )}
                      </div>
                      <div className="card-body">
                        <h3 style={{ margin: 0 }}>{item.name}</h3>
                        <div className="price-row">
                          <div className="price">{money(item.price)} MAD</div>
                          <Link className="btn ghost" to={`/product/${Number(item.id)}`}>View</Link>
                        </div>
                      </div>
                    </article>
                  )) : (
                    <div className="muted small">No related products for now.</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <aside id="cart" className={`drawer ${isCartOpen ? "open" : ""}`} aria-hidden={!isCartOpen}>
        <div className="drawer-head">
          <div>
            <div className="drawer-title">Shopping Cart</div>
            <div className="small muted">{lines.length ? `Items: ${cartApi.count}` : "Cart is empty"}</div>
          </div>
          <button id="closeCart" className="btn ghost" onClick={() => setIsCartOpen(false)}>X</button>
        </div>

        <div id="items" className="drawer-body">
          {!lines.length ? (
            <div className="muted">Your cart is empty.</div>
          ) : (
            lines.map((line) => {
              const imageUrl = line.product.image_url ? `${SERVER}${line.product.image_url}` : "";
              return (
                <div className="item" key={line.id}>
                  <div className="item-top">
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div className="cartthumb">
                        {imageUrl ? <img src={imageUrl} alt={line.product.name} /> : <div className="cartthumbFallback">{line.product.emoji || "Item"}</div>}
                      </div>
                      <div>
                        <div className="item-name">{line.product.name}</div>
                        <div className="small muted">Unit price: {money(line.product.price)} MAD</div>
                      </div>
                    </div>
                    <div><b>{money(Number(line.product.price) * line.qty)} MAD</b></div>
                  </div>
                  <div className="qty">
                    <button onClick={() => cartApi.changeQty(line.id, -1)}>-</button>
                    <b>{line.qty}</b>
                    <button onClick={() => cartApi.changeQty(line.id, 1)}>+</button>
                    <button className="btn ghost remove" onClick={() => cartApi.removeItem(line.id)}>Remove</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="drawer-foot">
          <div className="totals">
            <div className="row"><span>Subtotal</span><b>{money(totals.subtotal)}</b> <span className="muted">MAD</span></div>
            <div className="row"><span>Shipping</span><b>{money(totals.shipping)}</b> <span className="muted">MAD</span></div>
            <div className="row total"><span>Total</span><b>{money(totals.total)}</b> <span className="muted">MAD</span></div>
          </div>
          <Link className="btn primary" to="/">Checkout from Store</Link>
          <button id="clear" className="btn ghost" onClick={() => cartApi.clearCart()}>Clear Cart</button>
          <div className="small muted">Cash on delivery.</div>
        </div>
      </aside>

      <div id="backdrop" className="backdrop" hidden={!isCartOpen} onClick={() => setIsCartOpen(false)} />

      <Toast message={toastMessage} />
    </>
  );
}

function AuthPage({ mode }) {
  useRouteStylesheet("/auth.css");
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [toastMessage, showToast] = useToast(1800);

  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || "en");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const tr = {
    en: {
      login: "Sign in",
      register: "Sign up",
      ok: "Success",
      forgot: "Forgot password ?",
      fullName: "Full name",
      email: "Email",
      password: "Password",
      orSignIn: "Or Sign in",
      orSignUp: "Or Sign up"
    },
    fr: {
      login: "Connexion",
      register: "Creer un compte",
      ok: "Succes",
      forgot: "Mot de passe oublie ?",
      fullName: "Nom complet",
      email: "Email",
      password: "Mot de passe",
      orSignIn: "Ou se connecter",
      orSignUp: "Ou creer un compte"
    },
    ar: {
      login: "Sign in",
      register: "Sign up",
      ok: "Success",
      forgot: "Forgot password ?",
      fullName: "Full name",
      email: "Email",
      password: "Password",
      orSignIn: "Or Sign in",
      orSignUp: "Or Sign up"
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = isRegister ? "Register - Perfect Store" : "Login - Perfect Store";
  }, [lang, isRegister]);

  function changeLang(nextLang) {
    setLang(nextLang);
    localStorage.setItem(LANG_KEY, nextLang);
  }

  async function handleSubmit() {
    if (!email.trim() || !password) {
      showToast("Missing fields");
      return;
    }
    const payload = isRegister
      ? { fullName: fullName.trim(), email: email.trim(), password }
      : { email: email.trim(), password };

    if (isRegister && !payload.fullName) {
      showToast("Missing fields");
      return;
    }

    try {
      const data = await api(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      localStorage.setItem(USER_TOKEN_KEY, data.token);
      showToast((tr[lang] && tr[lang].ok) || "Success");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      showToast(err.message || "Request failed");
    }
  }

  const t = tr[lang] || tr.en;

  return (
    <>
      <main className="auth-layout">
        <section className="brand-panel">
          <div className="brand-copy">Share the Knowledge, Spread the Fun with SupShare</div>
        </section>

        <section className="form-panel">
          <div className="form-shell">
            <h1 className="form-title">{isRegister ? t.register : t.login}</h1>

            {isRegister ? (
              <input
                className="input-field"
                placeholder={t.fullName}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            ) : null}

            <input
              className="input-field"
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {!isRegister ? (
              <div className="forgot-pass"><a href="#" onClick={(e) => e.preventDefault()}>{t.forgot}</a></div>
            ) : null}

            <button className="input-submit" type="button" onClick={handleSubmit}>
              {isRegister ? t.register : t.login}
            </button>

            <Link className="input-submit secondary" to={isRegister ? "/auth" : "/auth/register"} role="button">
              {isRegister ? t.orSignIn : t.orSignUp}
            </Link>
          </div>

          <nav className="mini-footer">
            <a href="#" onClick={(e) => { e.preventDefault(); changeLang("en"); }}>English(UK)</a>
            <a href="#" onClick={(e) => { e.preventDefault(); changeLang("fr"); }}>Francais(FR)</a>
            <a href="#" onClick={(e) => { e.preventDefault(); changeLang("ar"); }}>Arabic</a>
          </nav>
        </section>
      </main>

      <Toast message={toastMessage} />
    </>
  );
}

function AdminPage() {
  useRouteStylesheet("/admin.css");
  const [toastMessage, showToast] = useToast();

  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || "");
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [form, setForm] = useState({
    id: "",
    name: "",
    price: "",
    category: "",
    emoji: "",
    stock: "",
    description: "",
    image_url: ""
  });

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    document.title = "Admin - Perfect Store";
  }, []);

  async function loadProducts() {
    try {
      const data = await api("/products");
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || "Failed to load products");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm({
      id: "",
      name: "",
      price: "",
      category: "",
      emoji: "",
      stock: "",
      description: "",
      image_url: ""
    });
    setImageFile(null);
    setImagePreview("");
  }

  function saveToken() {
    localStorage.setItem(ADMIN_TOKEN_KEY, token.trim());
    showToast("Token saved");
  }

  async function uploadImage(file, currentToken) {
    const fd = new FormData();
    fd.append("image", file);
    const data = await requestJson(`${API}/admin/upload`, {
      method: "POST",
      headers: { "x-admin-token": currentToken },
      body: fd
    });
    return data.imageUrl;
  }

  async function adminJson(path, currentToken, options = {}) {
    const headers = { ...(options.headers || {}), "x-admin-token": currentToken };
    return api(path, { ...options, headers });
  }

  async function onSubmit(event) {
    event.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) {
      showToast("Enter admin token first");
      return;
    }

    let imageUrl = form.image_url || "";
    if (imageFile) {
      try {
        imageUrl = await uploadImage(imageFile, cleanToken);
      } catch (err) {
        showToast(err.message || "Upload failed");
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      emoji: form.emoji.trim() || "Item",
      description: form.description.trim(),
      stock: Number(form.stock),
      image_url: imageUrl
    };

    if (!payload.name || !payload.category || !payload.description || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      showToast("Please complete required fields");
      return;
    }

    try {
      if (form.id) {
        await adminJson(`/admin/products/${Number(form.id)}`, cleanToken, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        showToast("Product updated");
      } else {
        await adminJson("/admin/products", cleanToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        showToast("Product added");
      }
      resetForm();
      await loadProducts();
    } catch (err) {
      showToast(err.message || "Save failed");
    }
  }

  function onFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image is too large (max 2MB)");
      event.target.value = "";
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function startEdit(product) {
    setForm({
      id: String(product.id),
      name: product.name || "",
      price: String(product.price || ""),
      category: product.category || "",
      emoji: product.emoji || "",
      stock: String(product.stock || 0),
      description: product.description || "",
      image_url: product.image_url || ""
    });
    setImageFile(null);
    setImagePreview(product.image_url ? `${SERVER}${product.image_url}` : "");
    showToast("Editing product");
  }

  async function deleteProduct(productId) {
    const cleanToken = token.trim();
    if (!cleanToken) {
      showToast("Enter admin token first");
      return;
    }
    try {
      await adminJson(`/admin/products/${Number(productId)}`, cleanToken, {
        method: "DELETE"
      });
      showToast("Product deleted");
      await loadProducts();
    } catch (err) {
      showToast(err.message || "Delete failed");
    }
  }

  async function loadOrders() {
    const cleanToken = token.trim();
    if (!cleanToken) {
      showToast("Enter admin token first");
      return;
    }
    try {
      const data = await adminJson("/admin/orders", cleanToken);
      setOrders(Array.isArray(data) ? data : []);
      showToast("Orders loaded");
    } catch (err) {
      showToast(err.message || "Failed loading orders");
    }
  }

  async function updateOrderStatus(orderId, status) {
    const cleanToken = token.trim();
    if (!cleanToken) {
      showToast("Enter admin token first");
      return;
    }
    try {
      await adminJson(`/admin/orders/${Number(orderId)}/status`, cleanToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      showToast(`Order #${orderId} updated`);
      await loadOrders();
    } catch (err) {
      showToast(err.message || "Failed updating status");
    }
  }

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const text = `${p.name || ""} ${p.category || ""} ${p.description || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [products, search]);

  return (
    <>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="mode-pill">Admin</div>
          <nav>
            <a href="#" onClick={(e) => e.preventDefault()}>Dashboard</a>
            <a className="active" href="#" onClick={(e) => e.preventDefault()}>Products</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Orders</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Customers</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Statistics</a>
            <a href="#" onClick={(e) => e.preventDefault()}>Settings</a>
          </nav>
          <div className="side-footer">Actions</div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div className="top-links">
              <a href="#" onClick={(e) => e.preventDefault()}>Language</a>
              <a href="#" onClick={(e) => e.preventDefault()}>Customer Messages</a>
              <Link to="/">Open Store</Link>
            </div>
          </header>

          <section className="glass-card token-bar">
            <label>
              Admin Token
              <input
                id="token"
                placeholder="Enter x-admin-token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </label>
            <button className="btn primary" id="saveToken" onClick={saveToken}>Save</button>
            <span className="hint">Set this from your server env ADMIN_TOKEN.</span>
          </section>

          <section className="glass-card form-card">
            <h2>Add / Edit Product</h2>
            <form id="productForm" className="form-grid" onSubmit={onSubmit}>
              <input type="hidden" id="id" value={form.id} readOnly />
              <input type="hidden" id="image_url" value={form.image_url} readOnly />

              <label>
                Product Name
                <input id="name" required value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </label>
              <label>
                Price (MAD)
                <input id="price" type="number" step="0.01" min="0" required value={form.price} onChange={(e) => setField("price", e.target.value)} />
              </label>
              <label>
                Category
                <input id="category" required value={form.category} onChange={(e) => setField("category", e.target.value)} />
              </label>
              <label>
                Emoji
                <input id="emoji" placeholder="Item" value={form.emoji} onChange={(e) => setField("emoji", e.target.value)} />
              </label>
              <label>
                Stock
                <input id="stock" type="number" step="1" min="0" required value={form.stock} onChange={(e) => setField("stock", e.target.value)} />
              </label>
              <label>
                Product Image
                <input id="imageFile" type="file" accept="image/*" onChange={onFileChange} />
              </label>

              <label className="wide">
                Description
                <textarea id="description" required value={form.description} onChange={(e) => setField("description", e.target.value)} />
              </label>

              <div className="preview-box">
                <div className="small">Preview</div>
                <img id="imagePreview" alt="preview" src={imagePreview} style={{ display: imagePreview ? "block" : "none" }} />
              </div>

              <div className="buttons wide">
                <button className="btn primary" type="submit">Save Product</button>
                <button
                  className="btn ghost"
                  type="button"
                  id="cancelEdit"
                  onClick={() => {
                    resetForm();
                    showToast("Edit canceled");
                  }}
                >
                  Cancel
                </button>
                <button className="btn ghost" type="button" id="refreshList" onClick={loadProducts}>Refresh List</button>
              </div>
            </form>
          </section>

          <section className="glass-card">
            <div className="list-head">
              <h1>Products Management</h1>
              <div className="head-actions">
                <input
                  id="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-wrap">
              <div className="table-head">
                <span>Image</span>
                <span>Product Name</span>
                <span>Price</span>
                <span>Stock</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              <div id="list" className="list">
                {filteredProducts.map((p) => {
                  const img = p.image_url ? `${SERVER}${p.image_url}` : "";
                  const inStock = Number(p.stock) > 0;
                  return (
                    <div className="row-item" key={p.id}>
                      <div>
                        {img ? (
                          <img className="p-thumb" src={img} alt={p.name} />
                        ) : (
                          <div className="p-thumb" style={{ display: "grid", placeItems: "center", fontSize: 22 }}>{p.emoji || "Item"}</div>
                        )}
                      </div>
                      <div>
                        <div className="itemName">{p.name}</div>
                        <div className="itemMeta">{p.description || "No description"}</div>
                        <div className="itemMeta">{p.category} - #{Number(p.id)}</div>
                      </div>
                      <div><strong>{money(p.price)} MAD</strong></div>
                      <div>{Number(p.stock || 0)}</div>
                      <div><span className={`pill ${inStock ? "ok" : "bad"}`}>{inStock ? "Active" : "Out"}</span></div>
                      <div className="itemActions">
                        <button className="btn primary" onClick={() => startEdit(p)}>Edit</button>
                        <button className="btn ghost" onClick={() => deleteProduct(p.id)}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div id="empty" className="empty" hidden={filteredProducts.length !== 0}>No products found.</div>
          </section>

          <section className="glass-card">
            <div className="list-head">
              <h2>Orders</h2>
              <button className="btn ghost" id="loadOrders" onClick={loadOrders}>Load Orders</button>
            </div>
            <div id="orders" className="orders">
              {orders.map((order) => {
                const phone = String(order.phone || "").replace(/\s+/g, "");
                const waLink = phone ? `https://wa.me/${phone.replace(/^0/, "212")}` : "";
                return (
                  <div className="item" key={order.id}>
                    <div className="itemTop">
                      <div>
                        <div className="itemName">Order #{order.id} <span className="pill">{String(order.status || "NEW")}</span></div>
                        <div className="itemMeta">{order.customer_name} - {order.phone}</div>
                        <div className="itemMeta">{order.address}</div>
                        {order.notes ? <div className="itemMeta">Notes: {order.notes}</div> : null}
                      </div>
                      <div style={{ fontWeight: 900 }}>{money(order.total)} MAD</div>
                    </div>

                    <div className="itemActions">
                      {waLink ? <a className="btn primary" target="_blank" rel="noreferrer" href={waLink}>WhatsApp</a> : null}
                      {["CONFIRMED", "SHIPPED", "DONE", "CANCELED"].map((status) => (
                        <button key={status} className="btn ghost" onClick={() => updateOrderStatus(order.id, status)}>
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="itemMeta" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
                      Items: {String(order.items_json || "")}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>

      <Toast message={toastMessage} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StorePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/auth" element={<AuthPage mode="login" />} />
        <Route path="/auth/register" element={<AuthPage mode="register" />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.createRoot(rootElement).render(<App />);
