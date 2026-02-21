import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Toast from "../components/Toast";
import Footer from "../components/layout/Footer";
import GlassCard from "../components/layout/GlassCard";
import LayoutShell from "../components/layout/LayoutShell";
import TopBar from "../components/layout/TopBar";
import ProductCard from "../components/store/ProductCard";
import Button from "../components/ui/Button";
import useCart from "../hooks/useCart";
import useToast from "../hooks/useToast";
import { formatPrice } from "../lib/format";
import { fetchProductDetails, resolveProductImage } from "../lib/productsApi";
import { CART_STORAGE_KEY } from "../lib/storage";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const [product, setProduct] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const [toastMessage, showToast] = useToast();
  const { count, addItem } = useCart(CART_STORAGE_KEY);

  useEffect(() => {
    document.title = t("meta.productDetails");
  }, [t, i18n.language]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchProductDetails(id).then((result) => {
      if (!active) return;
      setProduct(result.product);
      setCatalog(result.catalog);
      setSource(result.source);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return catalog
      .filter(
        (item) =>
          Number(item.id) !== Number(product.id) &&
          String(item.category).toLowerCase() === String(product.category).toLowerCase()
      )
      .slice(0, 3);
  }, [catalog, product]);

  const links = [
    { to: "/products", label: t("nav.products") },
    { to: "/login", label: t("nav.login") },
    { to: "/register", label: t("nav.register") },
    { to: "/admin", label: t("nav.admin") }
  ];

  function handleAddToCart(productId) {
    addItem(productId);
    showToast(t("product.addToast"));
  }

  return (
    <LayoutShell>
      <GlassCard className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <TopBar buyNowTo={product ? `/product/${product.id}` : "/products"} cartCount={count} links={links} />

        {loading ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="glass-card h-80 animate-pulse" />
            <div className="glass-card h-80 animate-pulse" />
          </div>
        ) : null}

        {!loading && !product ? (
          <div className="glass-card mt-6 space-y-4 p-8 text-center">
            <h1 className="text-2xl font-bold text-white">{t("product.notFoundTitle")}</h1>
            <p className="text-sm text-white/75">{t("product.notFoundHint")}</p>
            <Button to="/products" variant="primary">
              {t("actions.back")}
            </Button>
          </div>
        ) : null}

        {!loading && product ? (
          <section className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
              <div className="glass-card overflow-hidden">
                {resolveProductImage(product) ? (
                  <img
                    alt={product.name}
                    className="h-full min-h-[320px] w-full object-cover"
                    src={resolveProductImage(product)}
                  />
                ) : (
                  <div className="grid min-h-[320px] place-items-center text-6xl">{product.emoji || "🛍️"}</div>
                )}
              </div>

              <div className="glass-card space-y-4 p-5 sm:p-6">
                <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                  {product.category}
                </span>
                <h1 className="text-3xl font-extrabold text-white">{product.name}</h1>
                <p className="text-sm leading-relaxed text-white/80">{product.description}</p>
                <p className="text-3xl font-extrabold text-white">
                  {formatPrice(product.price, i18n.language)} {t("common.currency")}
                </p>
                <p className="text-sm text-white/70">{t("product.shippingNote")}</p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button to={`/product/${product.id}`} variant="secondary">
                    {t("actions.buyNow")}
                  </Button>
                  <Button onClick={() => handleAddToCart(product.id)} variant="primary">
                    {t("actions.addToCart")}
                  </Button>
                  <Button to="/products" variant="ghost">
                    {t("actions.back")}
                  </Button>
                </div>

                <p className="text-xs text-white/65">
                  {t("common.source", {
                    source: source === "api" ? t("common.sourceApi") : t("common.sourceMock")
                  })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">{t("product.related")}</h2>
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {relatedProducts.map((item) => (
                    <ProductCard key={item.id} onAddToCart={handleAddToCart} product={item} />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-6 text-sm text-white/75">{t("common.noResults")}</div>
              )}
            </div>
          </section>
        ) : null}

        <Footer />
      </GlassCard>

      <Toast message={toastMessage} />
    </LayoutShell>
  );
}
