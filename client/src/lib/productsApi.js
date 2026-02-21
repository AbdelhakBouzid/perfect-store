import { mockProducts } from "../data/mockProducts";
import { api } from "./api";
import { toAbsoluteUploadUrl } from "./config";

function normalizeProduct(product, index = 0) {
  return {
    ...product,
    id: Number(product.id || index + 1),
    name: String(product.name || ""),
    description: String(product.description || ""),
    category: String(product.category || "General"),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    emoji: String(product.emoji || "🛍️"),
    image_url: String(product.image_url || ""),
    created_at: product.created_at || product.createdAt || new Date(2025, 11, index + 1).toISOString()
  };
}

function normalizeProducts(products) {
  return Array.isArray(products) ? products.map((product, index) => normalizeProduct(product, index)) : [];
}

function buildProductsPath(query = "", category = "all") {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (category && category !== "all") params.set("category", category);
  const queryString = params.toString();
  return `/products${queryString ? `?${queryString}` : ""}`;
}

function filterLocalProducts(products, query = "", category = "all") {
  const normalizedQuery = query.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory = category === "all" ? true : product.category === category;
    const matchesQuery = normalizedQuery
      ? `${product.name} ${product.description}`.toLowerCase().includes(normalizedQuery)
      : true;
    return matchesCategory && matchesQuery;
  });
}

export async function fetchProducts(options = {}) {
  const { query = "", category = "all" } = options;
  try {
    const products = await api(buildProductsPath(query, category));
    return { products: normalizeProducts(products), source: "api" };
  } catch (_error) {
    const fallback = normalizeProducts(mockProducts);
    return { products: filterLocalProducts(fallback, query, category), source: "mock" };
  }
}

export async function fetchCategories() {
  try {
    const categories = await api("/categories");
    if (Array.isArray(categories) && categories.length > 0) {
      return [...new Set(categories.map((item) => String(item).trim()).filter(Boolean))];
    }
  } catch (_error) {
    // Ignore and use local fallback.
  }

  const fallback = normalizeProducts(mockProducts);
  return [...new Set(fallback.map((item) => item.category))];
}

export async function fetchProductDetails(id) {
  const numericId = Number(id);
  try {
    const [catalog, product] = await Promise.all([api("/products"), api(`/products/${numericId}`)]);
    const normalizedCatalog = normalizeProducts(catalog);
    const normalizedProduct = product ? normalizeProduct(product) : null;
    return { product: normalizedProduct, catalog: normalizedCatalog, source: "api" };
  } catch (_error) {
    const fallbackCatalog = normalizeProducts(mockProducts);
    const fallbackProduct = fallbackCatalog.find((item) => Number(item.id) === numericId) || null;
    return { product: fallbackProduct, catalog: fallbackCatalog, source: "mock" };
  }
}

export function pickFeaturedProduct(products) {
  if (!Array.isArray(products) || products.length === 0) return null;
  const sorted = [...products].sort((a, b) => {
    const aDate = Date.parse(a.created_at || a.createdAt || 0) || 0;
    const bDate = Date.parse(b.created_at || b.createdAt || 0) || 0;
    if (bDate !== aDate) return bDate - aDate;
    return Number(b.id || 0) - Number(a.id || 0);
  });
  return sorted[0] || null;
}

export function resolveProductImage(product) {
  const rawPath = String(product?.image_url || "").trim();
  if (!rawPath) return "";
  if (/^https?:\/\//i.test(rawPath)) return rawPath;
  return toAbsoluteUploadUrl(rawPath);
}
