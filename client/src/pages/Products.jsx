import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "../components/Toast";
import Footer from "../components/layout/Footer";
import GlassCard from "../components/layout/GlassCard";
import LayoutShell from "../components/layout/LayoutShell";
import TopBar from "../components/layout/TopBar";
import ProductCard from "../components/store/ProductCard";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import useCart from "../hooks/useCart";
import useToast from "../hooks/useToast";
import { formatPrice } from "../lib/format";
import {
  fetchCategories,
  fetchProducts,
  pickFeaturedProduct,
  resolveProductImage
} from "../lib/productsApi";
import { CART_STORAGE_KEY } from "../lib/storage";

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("api");
  const { count, addItem } = useCart(CART_STORAGE_KEY);
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
  const featuredImage = resolveProductImage(featuredProduct);

  const links = [
    { to: "/products", label: t("nav.products") },
    { to: "/login", label: t("nav.login") },
    { to: "/register", label: t("nav.register") },
    { to: "/admin", label: t("nav.admin") }
  ];

  function handleAddToCart(productId) {
    addItem(productId);
    showToast(t("products.addToast"));
  }

  const sourceLabel = source === "api" ? t("common.sourceApi") : t("common.sourceMock");

  return (
    <LayoutShell>
      <GlassCard className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <TopBar buyNowTo={featuredProduct ? `/product/${featuredProduct.id}` : "/products"} cartCount={count} links={links} />

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card flex flex-col justify-between gap-5 p-5 sm:p-6">
            <div className="space-y-3">
              <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                {source === "api" ? t("products.newest") : t("products.bestSeller")}
              </span>
              <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t("products.featured")}</h1>
              <p className="text-white/80">{t("products.subtitle")}</p>

              {featuredProduct ? (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white">{featuredProduct.name}</h2>
                  <p className="text-sm text-white/75">{featuredProduct.description}</p>
                  <p className="text-2xl font-extrabold text-white">
                    {formatPrice(featuredProduct.price, i18n.language)} {t("common.currency")}
                  </p>
                </div>
              ) : null}
            </div>

            {featuredProduct ? (
              <Button className="w-full sm:w-auto" to={`/product/${featuredProduct.id}`} variant="primary">
                {t("actions.buyNow")}
              </Button>
            ) : null}
          </div>

          <div className="glass-card overflow-hidden">
            {featuredProduct ? (
              <img
                alt={featuredProduct.name || t("products.heroFallback")}
                className="h-full min-h-[270px] w-full object-cover"
                src={featuredImage}
              />
            ) : (
              <div className="grid min-h-[270px] place-items-center text-5xl">🛍️</div>
            )}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_240px]">
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/75">
            <p>{loading ? t("common.loading") : t("products.results", { count: products.length })}</p>
            <p>{t("common.source", { source: sourceLabel })}</p>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-4 text-xl font-bold text-white">{t("products.sectionTitle")}</h2>
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="glass-card h-72 animate-pulse" key={`loader-${index}`} />
              ))}
            </div>
          ) : null}

          {!loading && products.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} onAddToCart={handleAddToCart} product={product} />
              ))}
            </div>
          ) : null}

          {!loading && products.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-lg font-semibold text-white">{t("common.noResults")}</p>
              <p className="mt-1 text-sm text-white/70">{t("common.noResultsHint")}</p>
            </div>
          ) : null}
        </section>

        <Footer />
      </GlassCard>

      <Toast message={toastMessage} />
    </LayoutShell>
  );
}
