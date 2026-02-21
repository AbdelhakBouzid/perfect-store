import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "../components/Toast";
import Footer from "../components/layout/Footer";
import GlassCard from "../components/layout/GlassCard";
import LayoutShell from "../components/layout/LayoutShell";
import TopBar from "../components/layout/TopBar";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import useToast from "../hooks/useToast";
import { requestJson } from "../lib/api";
import { API_URL } from "../lib/config";
import { formatPrice } from "../lib/format";
import { fetchProducts, resolveProductImage } from "../lib/productsApi";
import { ADMIN_TOKEN_STORAGE_KEY } from "../lib/storage";

const INITIAL_FORM = {
  id: "",
  name: "",
  price: "",
  category: "",
  stock: "",
  emoji: "???",
  image_url: "",
  description: ""
};

function readInitialToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
}

async function adminRequest(path, token, options = {}) {
  return requestJson(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "x-admin-token": token
    }
  });
}

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(readInitialToken);
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("api");
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [toastMessage, showToast] = useToast();

  useEffect(() => {
    document.title = t("meta.admin");
  }, [t, i18n.language]);

  async function loadProducts() {
    setLoading(true);
    const result = await fetchProducts();
    setProducts(result.products);
    setSource(result.source);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts().catch(() => showToast(t("admin.loadFailed")));
  }, []);

  const links = [
    { to: "/products", label: t("nav.products") },
    { to: "/login", label: t("nav.login") },
    { to: "/register", label: t("nav.register") },
    { to: "/admin", label: t("nav.admin") }
  ];

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter((item) => {
      const text = `${item.name} ${item.category} ${item.description}`.toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [products, query]);

  function saveToken() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token.trim());
    }
    showToast(t("admin.tokenSaved"));
  }

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
  }

  function startEdit(product) {
    setForm({
      id: String(product.id),
      name: product.name || "",
      price: String(product.price || ""),
      category: product.category || "",
      stock: String(product.stock || ""),
      emoji: product.emoji || "???",
      image_url: product.image_url || "",
      description: product.description || ""
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category.trim(),
      stock: Number(form.stock),
      emoji: form.emoji.trim() || "???",
      image_url: form.image_url.trim(),
      description: form.description.trim()
    };

    if (
      !payload.name ||
      !payload.category ||
      !payload.description ||
      Number.isNaN(payload.price) ||
      Number.isNaN(payload.stock)
    ) {
      showToast(t("auth.missingFields"));
      return;
    }

    const canCallApi = source === "api" && token.trim();
    const isEditing = Boolean(form.id);

    if (canCallApi) {
      try {
        if (isEditing) {
          await adminRequest(`/admin/products/${Number(form.id)}`, token.trim(), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await adminRequest("/admin/products", token.trim(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
        showToast(t("admin.savedApi"));
        resetForm();
        await loadProducts();
        return;
      } catch (error) {
        showToast(error.message || t("admin.loadFailed"));
      }
    }

    if (source === "api" && !token.trim()) {
      showToast(t("admin.tokenRequired"));
    }

    setProducts((current) => {
      if (isEditing) {
        return current.map((item) => (Number(item.id) === Number(form.id) ? { ...item, ...payload } : item));
      }

      const nextId = current.length ? Math.max(...current.map((item) => Number(item.id))) + 1 : 1;
      return [{ id: nextId, created_at: new Date().toISOString(), ...payload }, ...current];
    });
    resetForm();
    showToast(t("admin.savedLocal"));
  }

  async function handleDelete(productId) {
    const canCallApi = source === "api" && token.trim();
    if (canCallApi) {
      try {
        await adminRequest(`/admin/products/${Number(productId)}`, token.trim(), { method: "DELETE" });
        showToast(t("admin.deletedApi"));
        await loadProducts();
        return;
      } catch (error) {
        showToast(error.message || t("admin.loadFailed"));
      }
    }

    setProducts((current) => current.filter((item) => Number(item.id) !== Number(productId)));
    showToast(t("admin.deletedLocal"));
  }

  return (
    <LayoutShell>
      <GlassCard className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
        <TopBar buyNowTo="/products" cartCount={products.length} links={links} />

        <section className="glass-card space-y-4 p-4 sm:p-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-white">{t("admin.title")}</h1>
            <p className="text-sm text-white/75">{t("admin.subtitle")}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              label={t("admin.tokenLabel")}
              onChange={(event) => setToken(event.target.value)}
              placeholder={t("admin.tokenPlaceholder")}
              value={token}
            />
            <Button className="sm:self-end" onClick={saveToken} type="button" variant="secondary">
              {t("admin.saveToken")}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/75">
            <p>{t("admin.tokenHint")}</p>
            <p>
              {t("admin.mode")}: {source === "api" ? t("admin.modeApi") : t("admin.modeMock")}
            </p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <form className="glass-card space-y-4 p-4 sm:p-5" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-white">
              {form.id ? t("admin.formEdit", { id: form.id }) : t("admin.formCreate")}
            </h2>

            <Input
              label={t("admin.name")}
              onChange={(event) => setField("name", event.target.value)}
              value={form.name}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={`${t("admin.price")} (${t("common.currency")})`}
                min="0"
                onChange={(event) => setField("price", event.target.value)}
                step="0.01"
                type="number"
                value={form.price}
              />
              <Input
                label={t("admin.stock")}
                min="0"
                onChange={(event) => setField("stock", event.target.value)}
                step="1"
                type="number"
                value={form.stock}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label={t("admin.category")}
                onChange={(event) => setField("category", event.target.value)}
                value={form.category}
              />
              <Input
                label={t("admin.emoji")}
                onChange={(event) => setField("emoji", event.target.value)}
                value={form.emoji}
              />
            </div>
            <Input
              label={t("admin.image")}
              onChange={(event) => setField("image_url", event.target.value)}
              value={form.image_url}
            />
            <label className="flex flex-col gap-2 text-sm font-medium text-white/90">
              <span>{t("admin.description")}</span>
              <textarea
                className="surface-field min-h-[120px] resize-y"
                onChange={(event) => setField("description", event.target.value)}
                value={form.description}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="primary">
                {form.id ? t("admin.submitUpdate") : t("admin.submitCreate")}
              </Button>
              {form.id ? (
                <Button onClick={resetForm} type="button" variant="ghost">
                  {t("admin.cancelEdit")}
                </Button>
              ) : null}
            </div>
          </form>

          <div className="glass-card space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-white">{t("admin.listTitle")}</h2>
              <Input
                className="sm:w-[280px]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("admin.searchPlaceholder")}
                value={query}
              />
            </div>

            {loading ? (
              <div className="glass-card h-44 animate-pulse" />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/20">
                <table className="min-w-full text-sm text-white/90">
                  <thead className="bg-black/25 text-xs uppercase tracking-wide text-white/70">
                    <tr>
                      <th className="px-3 py-3 text-start">{t("admin.tableImage")}</th>
                      <th className="px-3 py-3 text-start">{t("admin.tableProduct")}</th>
                      <th className="px-3 py-3 text-start">{t("admin.tablePrice")}</th>
                      <th className="px-3 py-3 text-start">{t("admin.tableStock")}</th>
                      <th className="px-3 py-3 text-start">{t("admin.tableStatus")}</th>
                      <th className="px-3 py-3 text-start">{t("admin.tableActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const imageUrl = resolveProductImage(product);
                      const inStock = Number(product.stock) > 0;
                      return (
                        <tr className="border-t border-white/10" key={product.id}>
                          <td className="px-3 py-3">
                            {imageUrl ? (
                              <img
                                alt={product.name}
                                className="h-10 w-14 rounded-lg border border-white/20 object-cover"
                                src={imageUrl}
                              />
                            ) : (
                              <div className="grid h-10 w-14 place-items-center rounded-lg border border-white/20 bg-black/25">
                                {product.emoji || "???"}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-white/70">{product.category}</p>
                          </td>
                          <td className="px-3 py-3">
                            {formatPrice(product.price, i18n.language)} {t("common.currency")}
                          </td>
                          <td className="px-3 py-3">{product.stock}</td>
                          <td className="px-3 py-3">
                            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs">
                              {inStock ? t("common.active") : t("common.outOfStock")}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Button onClick={() => startEdit(product)} size="sm" type="button" variant="secondary">
                                {t("actions.edit")}
                              </Button>
                              <Button onClick={() => handleDelete(product.id)} size="sm" type="button" variant="danger">
                                {t("actions.delete")}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filteredProducts.length === 0 ? (
              <div className="glass-card p-5 text-center text-sm text-white/75">{t("admin.empty")}</div>
            ) : null}
          </div>
        </section>

        <Footer />
      </GlassCard>

      <Toast message={toastMessage} />
    </LayoutShell>
  );
}
