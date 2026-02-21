import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";
import Toast from "../components/Toast";
import useCart from "../hooks/useCart";
import useToast from "../hooks/useToast";
import { api } from "../lib/api";
import { buildCartLines, calcTotals } from "../lib/cart";
import { toAbsoluteUploadUrl } from "../lib/config";
import { money } from "../lib/format";
import { CART_STORAGE_KEY } from "../lib/storage";
import "../styles/store.css";

const EMPTY_CHECKOUT_FORM = {
  name: "",
  phone: "",
  address: "",
  notes: ""
};

function buildProductsPath(query, category) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category && category !== "all") params.set("category", category);
  const queryString = params.toString();
  return `/products${queryString ? `?${queryString}` : ""}`;
}

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(EMPTY_CHECKOUT_FORM);

  const { cart, count, addItem, changeQty, removeItem, clearCart } = useCart(CART_STORAGE_KEY);
  const [toastMessage, showToast] = useToast();

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    document.title = "Perfect Store";
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 220);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      try {
        const [cats, allProducts] = await Promise.all([api("/categories"), api("/products")]);
        if (cancelled) return;
        const normalizedCategories = Array.isArray(cats) ? cats : [];
        const normalizedProducts = Array.isArray(allProducts) ? allProducts : [];
        setCategories(normalizedCategories);
        setCatalog(normalizedProducts);
        setProducts(normalizedProducts);
      } catch (error) {
        if (!cancelled) showToast(error.message || "Failed to load store");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFilteredProducts() {
      setLoading(true);
      try {
        const data = await api(buildProductsPath(debouncedQuery, category));
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          showToast(error.message || "Failed to load products");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFilteredProducts();
    return () => {
      cancelled = true;
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

  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "priceAsc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "priceDesc") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === "nameAsc") list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    return list;
  }, [products, sortBy]);

  const cartCatalog = catalog.length ? catalog : products;
  const cartLines = useMemo(() => buildCartLines(cart, cartCatalog), [cart, cartCatalog]);
  const totals = useMemo(() => calcTotals(cartLines), [cartLines]);

  async function handleRefresh() {
    setLoading(true);
    try {
      const [cats, allProducts, filteredProducts] = await Promise.all([
        api("/categories"),
        api("/products"),
        api(buildProductsPath(debouncedQuery, category))
      ]);

      setCategories(Array.isArray(cats) ? cats : []);
      setCatalog(Array.isArray(allProducts) ? allProducts : []);
      setProducts(Array.isArray(filteredProducts) ? filteredProducts : []);
      showToast("Refreshed");
    } catch (error) {
      showToast(error.message || "Refresh failed");
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(productId) {
    addItem(productId);
    setIsCartOpen(true);
    showToast("Added to cart");
  }

  async function handlePlaceOrder() {
    if (!cartLines.length) {
      showToast("Cart is empty");
      return;
    }

    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim() || !checkoutForm.address.trim()) {
      showToast("Please fill name, phone and address");
      return;
    }

    const payload = {
      name: checkoutForm.name.trim(),
      phone: checkoutForm.phone.trim(),
      address: checkoutForm.address.trim(),
      notes: checkoutForm.notes.trim(),
      items: cartLines.map((line) => ({ productId: line.id, qty: line.qty }))
    };

    try {
      const response = await api("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      showToast(`Order #${response.orderId} created`);
      clearCart();
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCheckoutForm(EMPTY_CHECKOUT_FORM);

      const [allProducts, filteredProducts] = await Promise.all([
        api("/products"),
        api(buildProductsPath(debouncedQuery, category))
      ]);
      setCatalog(Array.isArray(allProducts) ? allProducts : []);
      setProducts(Array.isArray(filteredProducts) ? filteredProducts : []);
    } catch (error) {
      showToast(error.message || "Order failed");
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar-row">
          <div className="mode-pill">Store</div>
          <nav className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-content">
          <h1>
            Latest <span>Tech and Gadgets</span>
          </h1>
          <p>Find the best deals on electronics</p>
          <div className="hero-meta">
            <span>Mode: API</span>
            <span>
              Products: <b>{products.length}</b>
            </span>
          </div>
        </div>
      </section>

      <section className="container toolbar">
        <div className="tabs-row">
          <select
            className="tab-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            placeholder="Search products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A to Z</option>
          </select>

          <button className="btn ghost" type="button" onClick={handleRefresh}>
            Refresh
          </button>
          <button className="btn primary" type="button" onClick={() => setIsCartOpen(true)}>
            Cart <span className="badge">{count}</span>
          </button>
        </div>

        <div className="small muted">
          Results: {sortedProducts.length} {loading ? "(loading...)" : ""}
        </div>
      </section>

      <main className="container">
        {sortedProducts.length ? (
          <section className="grid">
            {sortedProducts.map((product) => {
              const outOfStock = Number(product.stock) <= 0;
              const imageUrl = product.image_url ? toAbsoluteUploadUrl(product.image_url) : "";

              return (
                <article className="card" key={product.id}>
                  <div className="thumb">
                    {imageUrl ? (
                      <img src={imageUrl} alt={product.name} />
                    ) : (
                      <div className="fallback">{product.emoji || "Item"}</div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="meta">
                      <span className="pill">{product.category || ""}</span>
                      <span className={`pill ${outOfStock ? "out" : ""}`}>
                        {outOfStock ? "Out of stock" : `In stock: ${Number(product.stock)}`}
                      </span>
                    </div>
                    <h3>
                      <Link className="plink" to={`/product/${Number(product.id)}`}>
                        {product.name}
                      </Link>
                    </h3>
                    <p className="desc">{product.description || ""}</p>
                    <div className="price-row">
                      <div className="price">{money(product.price)} MAD</div>
                      <button
                        className="btn primary"
                        type="button"
                        disabled={outOfStock}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        Shop Now
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="empty">
            <div className="empty-emoji">No Results</div>
            <div className="empty-title">No products found</div>
            <div className="empty-sub">Change category or search query.</div>
          </div>
        )}
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        lines={cartLines}
        count={count}
        totals={totals}
        onIncrease={(id) => changeQty(id, 1)}
        onDecrease={(id) => changeQty(id, -1)}
        onRemove={removeItem}
        onClear={() => {
          clearCart();
          showToast("Cart cleared");
        }}
        onCheckout={() => {
          if (!cartLines.length) {
            showToast("Cart is empty");
            return;
          }
          setIsCheckoutOpen(true);
        }}
        checkoutLabel="Checkout"
      />

      <div
        className="backdrop"
        hidden={!(isCartOpen || isCheckoutOpen)}
        onClick={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(false);
        }}
      />

      <section className="modal" hidden={!isCheckoutOpen}>
        <div className="modal-card">
          <div className="modal-head">
            <div>
              <div className="modal-title">Checkout</div>
              <div className="small muted">Fill this form and confirm your order.</div>
            </div>
            <button className="btn ghost" type="button" onClick={() => setIsCheckoutOpen(false)}>
              X
            </button>
          </div>

          <div className="modal-body">
            <div className="form-row">
              <label>
                Full Name
                <input
                  placeholder="John Doe"
                  value={checkoutForm.name}
                  onChange={(event) =>
                    setCheckoutForm((prev) => ({
                      ...prev,
                      name: event.target.value
                    }))
                  }
                />
              </label>
              <label>
                Phone
                <input
                  placeholder="+212..."
                  value={checkoutForm.phone}
                  onChange={(event) =>
                    setCheckoutForm((prev) => ({
                      ...prev,
                      phone: event.target.value
                    }))
                  }
                />
              </label>
            </div>

            <label>
              Address
              <input
                placeholder="City / Street..."
                value={checkoutForm.address}
                onChange={(event) =>
                  setCheckoutForm((prev) => ({
                    ...prev,
                    address: event.target.value
                  }))
                }
              />
            </label>

            <label>
              Notes (optional)
              <textarea
                placeholder="Color / size / time..."
                value={checkoutForm.notes}
                onChange={(event) =>
                  setCheckoutForm((prev) => ({
                    ...prev,
                    notes: event.target.value
                  }))
                }
              />
            </label>

            <div className="modal-foot">
              <button className="btn primary" type="button" onClick={handlePlaceOrder}>
                Confirm Order
              </button>
              <button className="btn ghost" type="button" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>

      <Toast message={toastMessage} />
    </>
  );
}

