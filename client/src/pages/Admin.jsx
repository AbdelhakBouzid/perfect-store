import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SiteLayout from "../components/layout/SiteLayout";
import Container from "../components/layout/Container";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toast from "../components/Toast";
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
  emoji: "🛍️",
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
      emoji: product.emoji || "🛍️",
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
      emoji: form.emoji.trim() || "🛍️",
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

    showToast(t("admin.savedLocal"));
    resetForm();
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
    <SiteLayout>
      <Container className="space-y-6">
        <section className="surface-card space-y-4 p-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t("admin.title")}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("admin.subtitle")}</p>
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

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <p>{t("admin.tokenHint")}</p>
            <p>
              {t("admin.mode")}: {source === "api" ? t("admin.modeApi") : t("admin.modeMock")}
            </p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <form className="surface-card space-y-4 p-5" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
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
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>{t("admin.description")}</span>
              <textarea
                className="input-base min-h-[120px] resize-y"
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

          <div className="surface-card space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t("admin.listTitle")}</h2>
              <Input
                className="sm:w-[280px]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("admin.searchPlaceholder")}
                value={query}
              />
            </div>

            {loading ? (
              <div className="surface-card h-44 animate-pulse" />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
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
                        <tr className="border-t border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200" key={product.id}>
                          <td className="px-3 py-3">
                            {imageUrl ? (
                              <img
                                alt={product.name}
                                className="h-10 w-14 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                                src={imageUrl}
                              />
                            ) : (
                              <div className="grid h-10 w-14 place-items-center rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                                {product.emoji || "🛍️"}
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
                          </td>
                          <td className="px-3 py-3">
                            {formatPrice(product.price, i18n.language)} {t("common.currency")}
                          </td>
                          <td className="px-3 py-3">{product.stock}</td>
                          <td className="px-3 py-3">
                            <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs dark:border-slate-600 dark:bg-slate-800">
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
              <div className="surface-card p-5 text-center text-sm text-slate-500 dark:text-slate-400">{t("admin.empty")}</div>
            ) : null}
          </div>
        </section>
      </Container>

      <Toast message={toastMessage} />
    </SiteLayout>
  );
}
