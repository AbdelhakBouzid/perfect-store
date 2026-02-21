import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import ProductCard from "../components/store/ProductCard";
import Button from "../components/ui/Button";
import Toast from "../components/Toast";
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
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart(CART_STORAGE_KEY);
  const [toastMessage, showToast] = useToast();

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
      .slice(0, 4);
  }, [catalog, product]);

  function handleAddToCart(productId) {
    addItem(productId);
    showToast(t("product.addToast"));
  }

  return (
    <SiteLayout>
      <Container className="space-y-6">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="surface-card h-96 animate-pulse" />
            <div className="surface-card h-96 animate-pulse" />
          </div>
        ) : null}

        {!loading && !product ? (
          <section className="surface-card p-8 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t("product.notFoundTitle")}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t("product.notFoundHint")}</p>
            <Button className="mt-4" to="/products" variant="primary">
              {t("actions.back")}
            </Button>
          </section>
        ) : null}

        {!loading && product ? (
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="surface-card overflow-hidden">
              {resolveProductImage(product) ? (
                <img alt={product.name} className="h-full max-h-[620px] w-full object-cover" src={resolveProductImage(product)} />
              ) : (
                <div className="grid min-h-[420px] place-items-center text-6xl">{product.emoji || "🛍️"}</div>
              )}
            </div>

            <div className="surface-card space-y-4 p-5 sm:p-6">
              <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800 dark:bg-slate-800 dark:text-slate-200">
                {product.category}
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 sm:text-3xl">{product.name}</h1>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{product.description}</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-50">
                {formatPrice(product.price, i18n.language)} {t("common.currency")}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("product.shippingNote")}</p>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => handleAddToCart(product.id)} variant="primary">
                  {t("actions.addToCart")}
                </Button>
                <Button to="/checkout" variant="secondary">
                  {t("actions.buyNow")}
                </Button>
                <Button to="/products" variant="ghost">
                  {t("actions.back")}
                </Button>
              </div>
            </div>
          </section>
        ) : null}

        {!loading && relatedProducts.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{t("product.related")}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} onAddToCart={handleAddToCart} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>

      <Toast message={toastMessage} />
    </SiteLayout>
  );
}
