import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import ProductCard from "../components/store/ProductCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Toast from "../components/Toast";
import useCart from "../hooks/useCart";
import useToast from "../hooks/useToast";
import { formatPrice } from "../lib/format";
import { fetchCategories, fetchProducts, pickFeaturedProduct, resolveProductImage } from "../lib/productsApi";
import { CART_STORAGE_KEY } from "../lib/storage";

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("api");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart(CART_STORAGE_KEY);
  const [toastMessage, showToast] = useToast();

  useEffect(() => {
    document.title = t("meta.products");
  }, [t, i18n.language]);

  useEffect(() => {
    let active = true;
    fetchCategories().then((items) => {
      if (!active) return;
      setCategories(items);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      const result = await fetchProducts({ query, category });
      if (!active) return;
      setProducts(result.products);
      setSource(result.source);
      setLoading(false);
    }, 180);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, category]);

  const featuredProduct = useMemo(() => pickFeaturedProduct(products), [products]);

  function handleAddToCart(productId) {
    addItem(productId);
    showToast(t("products.addToast"));
  }

  return (
    <SiteLayout>
      <Container className="space-y-6">
        <section className="surface-card overflow-hidden">
          <div className="relative min-h-[320px] w-full sm:min-h-[380px] lg:min-h-[440px]">
            {featuredProduct && resolveProductImage(featuredProduct) ? (
              <img
                alt={featuredProduct.name || t("products.heroFallback")}
                className="absolute inset-0 h-full w-full object-cover"
                src={resolveProductImage(featuredProduct)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-brand-200 to-accent-200 dark:from-slate-800 dark:to-slate-700" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <div className="max-w-xl space-y-2 text-white">
                <p className="inline-flex rounded-full bg-white/25 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {t("products.featuredHint")}
                </p>
                <h1 className="text-2xl font-extrabold sm:text-3xl">{featuredProduct?.name || t("products.featured")}</h1>
                {featuredProduct ? (
                  <p className="text-sm text-white/90">
                    {formatPrice(featuredProduct.price, i18n.language)} {t("common.currency")}
                  </p>
                ) : null}
              </div>
              {featuredProduct ? (
                <Button className="mt-4" to={`/product/${featuredProduct.id}`} variant="primary">
                  {t("actions.buyNow")}
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="surface-card p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_260px]">
            <Input
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("products.searchPlaceholder")}
              value={query}
            />
            <Select onChange={(event) => setCategory(event.target.value)} value={category}>
              <option value="all">{t("common.allCategories")}</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
            <p>{loading ? t("common.loading") : t("products.results", { count: products.length })}</p>
            <p>
              {t("common.source", {
                source: source === "api" ? t("common.sourceApi") : t("common.sourceMock")
              })}
            </p>
          </div>
        </section>

        <section>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div className="surface-card h-64 animate-pulse" key={`skeleton-${index}`} />
              ))}
            </div>
          ) : null}

          {!loading && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} onAddToCart={handleAddToCart} product={product} />
              ))}
            </div>
          ) : null}

          {!loading && products.length === 0 ? (
            <div className="surface-card p-8 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("common.noResults")}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("common.noResultsHint")}</p>
            </div>
          ) : null}
        </section>
      </Container>

      <Toast message={toastMessage} />
    </SiteLayout>
  );
}
