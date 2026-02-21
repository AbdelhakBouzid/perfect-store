import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
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

export default function ProductPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = Number(params.id || searchParams.get("id") || 0);

  const [product, setProduct] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cart, count, addItem, changeQty, removeItem, clearCart } = useCart(CART_STORAGE_KEY);
  const [toastMessage, showToast] = useToast();

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      if (!productId) {
        setError("Missing product id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [allProducts, productData] = await Promise.all([
          api("/products"),
          api(`/products/${productId}`)
        ]);

        if (cancelled) return;

        const normalizedCatalog = Array.isArray(allProducts) ? allProducts : [];
        setCatalog(normalizedCatalog);
        setProduct(productData || null);
        document.title = productData ? `${productData.name} - Perfect Store` : "Product - Perfect Store";
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message || "Failed to load product");
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    function onEscape(event) {
      if (event.key === "Escape") {
        setIsCartOpen(false);
      }
    }

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const cartLines = useMemo(() => buildCartLines(cart, catalog), [cart, catalog]);
  const totals = useMemo(() => calcTotals(cartLines), [cartLines]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return catalog
      .filter((item) => Number(item.id) !== Number(product.id) && item.category === product.category)
      .slice(0, 6);
  }, [catalog, product]);

  function handleAddToCart() {
    if (!product || Number(product.stock) <= 0) return;
    addItem(product.id);
    setIsCartOpen(true);
    showToast("Added to cart");
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar-row">
          <div className="brand">
            <div className="logo">Store</div>
            <div>
              <div className="brand-name">Perfect Store</div>
              <div className="brand-sub">Product Page</div>
            </div>
          </div>

          <div className="actions">
            <Link className="btn ghost" to="/">
              Back to Store
            </Link>
            <button className="btn primary" type="button" onClick={() => setIsCartOpen(true)}>
              Cart <span className="badge">{count}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container product-main">
        {loading ? (
          <section className="card loading-card">
            <b>Loading...</b>
            <div className="muted small">Fetching product data</div>
          </section>
        ) : null}

        {!loading && error ? (
          <section className="card loading-card">
            <b>Error: {error}</b>
            <div className="muted small">Go back to the store and try another product.</div>
          </section>
        ) : null}

        {!loading && !error && product ? (
          <section className="pwrap">
            <div className="pimg">
              {product.image_url ? (
                <img src={toAbsoluteUploadUrl(product.image_url)} alt={product.name} />
              ) : (
                <div className="pimg-fallback">{product.emoji || "Item"}</div>
              )}
            </div>

            <div className="pinfo">
              <div className="meta pmeta">
                <span className="pill">{product.category || ""}</span>
                <span className="pill">
                  {Number(product.stock) > 0 ? `In stock: ${Number(product.stock)}` : "Out of stock"}
                </span>
              </div>

              <h1 className="product-title">{product.name}</h1>
              <p className="desc product-desc">{product.description || ""}</p>

              <div className="price-row product-price-row">
                <div className="price product-price">{money(product.price)} MAD</div>
                <button
                  className="btn primary"
                  type="button"
                  onClick={handleAddToCart}
                  disabled={Number(product.stock) <= 0}
                >
                  {Number(product.stock) <= 0 ? "Out of stock" : "Add to cart"}
                </button>
              </div>

              <div className="small muted product-help">
                Cash on delivery. Free shipping for orders above 600 MAD.
              </div>

              <div className="related-block">
                <h3>Related Products</h3>
                {relatedProducts.length ? (
                  <div className="grid related-grid">
                    {relatedProducts.map((item) => {
                      const imageUrl = item.image_url ? toAbsoluteUploadUrl(item.image_url) : "";
                      return (
                        <article className="card" key={item.id}>
                          <div className="thumb">
                            {imageUrl ? (
                              <img src={imageUrl} alt={item.name} />
                            ) : (
                              <div className="fallback">{item.emoji || "Item"}</div>
                            )}
                          </div>
                          <div className="card-body">
                            <h3>{item.name}</h3>
                            <div className="price-row">
                              <div className="price">{money(item.price)} MAD</div>
                              <Link className="btn ghost" to={`/product/${Number(item.id)}`}>
                                View
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="small muted">No similar products found.</div>
                )}
              </div>
            </div>
          </section>
        ) : null}
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
        onCheckout={() => navigate("/")}
        checkoutLabel="Checkout in Store"
        showCheckoutLink
      />

      <div className="backdrop" hidden={!isCartOpen} onClick={() => setIsCartOpen(false)} />

      <Toast message={toastMessage} />
    </>
  );
}

