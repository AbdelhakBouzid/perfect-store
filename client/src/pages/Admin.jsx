import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import { api, requestJson } from "../lib/api";
import { API_URL, toAbsoluteUploadUrl } from "../lib/config";
import { money } from "../lib/format";
import { ADMIN_TOKEN_STORAGE_KEY } from "../lib/storage";
import "../styles/admin.css";

const INITIAL_FORM = {
  id: "",
  name: "",
  price: "",
  category: "",
  emoji: "",
  stock: "",
  description: "",
  image_url: ""
};

function readInitialToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
}

export default function AdminPage() {
  const [token, setToken] = useState(readInitialToken);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [toastMessage, showToast] = useToast();

  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    document.title = "Admin - Perfect Store";
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await api("/products");
      setProducts(Array.isArray(response) ? response : []);
    } catch (error) {
      showToast(error.message || "Failed to load products");
    }
  }

  function saveToken() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token.trim());
    }
    showToast("Token saved");
  }

  function setField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(INITIAL_FORM);
    setImageFile(null);
    setImagePreview("");
    setFileInputKey((prev) => prev + 1);
  }

  async function adminRequest(path, currentToken, options = {}) {
    return requestJson(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        "x-admin-token": currentToken
      }
    });
  }

  async function uploadImage(file, currentToken) {
    const formData = new FormData();
    formData.append("image", file);

    const response = await adminRequest("/admin/upload", currentToken, {
      method: "POST",
      body: formData
    });
    return response.imageUrl;
  }

  function onFileChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Image is too large (max 2MB)");
      setFileInputKey((prev) => prev + 1);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(String(reader.result || ""));
    reader.readAsDataURL(file);
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
      } catch (error) {
        showToast(error.message || "Upload failed");
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

    if (
      !payload.name ||
      !payload.category ||
      !payload.description ||
      Number.isNaN(payload.price) ||
      Number.isNaN(payload.stock)
    ) {
      showToast("Please complete required fields");
      return;
    }

    try {
      if (form.id) {
        await adminRequest(`/admin/products/${Number(form.id)}`, cleanToken, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        showToast("Product updated");
      } else {
        await adminRequest("/admin/products", cleanToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        showToast("Product added");
      }
      resetForm();
      await loadProducts();
    } catch (error) {
      showToast(error.message || "Save failed");
    }
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
    setImagePreview(product.image_url ? toAbsoluteUploadUrl(product.image_url) : "");
    setFileInputKey((prev) => prev + 1);
    showToast("Editing product");
  }

  async function deleteProduct(productId) {
    const cleanToken = token.trim();
    if (!cleanToken) {
      showToast("Enter admin token first");
      return;
    }

    try {
      await adminRequest(`/admin/products/${Number(productId)}`, cleanToken, {
        method: "DELETE"
      });
      showToast("Product deleted");
      await loadProducts();
    } catch (error) {
      showToast(error.message || "Delete failed");
    }
  }

  async function loadOrders() {
    const cleanToken = token.trim();
    if (!cleanToken) {
      showToast("Enter admin token first");
      return;
    }

    try {
      const response = await adminRequest("/admin/orders", cleanToken);
      setOrders(Array.isArray(response) ? response : []);
      showToast("Orders loaded");
    } catch (error) {
      showToast(error.message || "Failed to load orders");
    }
  }

  async function updateOrderStatus(orderId, status) {
    const cleanToken = token.trim();
    if (!cleanToken) {
      showToast("Enter admin token first");
      return;
    }

    try {
      await adminRequest(`/admin/orders/${Number(orderId)}/status`, cleanToken, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      showToast(`Order #${orderId} updated`);
      await loadOrders();
    } catch (error) {
      showToast(error.message || "Failed updating order");
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter((product) => {
      const text = `${product.name || ""} ${product.category || ""} ${product.description || ""}`.toLowerCase();
      return text.includes(normalizedQuery);
    });
  }, [products, search]);

  return (
    <>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="mode-pill">Admin</div>
          <nav>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Dashboard
            </a>
            <a className="active" href="#" onClick={(event) => event.preventDefault()}>
              Products
            </a>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Orders
            </a>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Customers
            </a>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Statistics
            </a>
            <a href="#" onClick={(event) => event.preventDefault()}>
              Settings
            </a>
          </nav>
          <div className="side-footer">Actions</div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div className="top-links">
              <a href="#" onClick={(event) => event.preventDefault()}>
                Language
              </a>
              <a href="#" onClick={(event) => event.preventDefault()}>
                Customer Messages
              </a>
              <Link to="/">Open Store</Link>
            </div>
          </header>

          <section className="glass-card token-bar">
            <label>
              Admin Token
              <input
                placeholder="Enter x-admin-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
            <button className="btn primary" type="button" onClick={saveToken}>
              Save
            </button>
            <span className="hint">Set this to your backend ADMIN_TOKEN value.</span>
          </section>

          <section className="glass-card form-card">
            <h2>Add / Edit Product</h2>
            <form className="form-grid" onSubmit={onSubmit}>
              <input type="hidden" value={form.id} readOnly />
              <input type="hidden" value={form.image_url} readOnly />

              <label>
                Product Name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                />
              </label>
              <label>
                Price (MAD)
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                />
              </label>
              <label>
                Category
                <input
                  required
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                />
              </label>
              <label>
                Emoji
                <input value={form.emoji} onChange={(event) => setField("emoji", event.target.value)} />
              </label>
              <label>
                Stock
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={form.stock}
                  onChange={(event) => setField("stock", event.target.value)}
                />
              </label>
              <label>
                Product Image
                <input key={fileInputKey} type="file" accept="image/*" onChange={onFileChange} />
              </label>

              <label className="wide">
                Description
                <textarea
                  required
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                />
              </label>

              <div className="preview-box">
                <div className="small">Preview</div>
                <img
                  alt="preview"
                  src={imagePreview}
                  style={{ display: imagePreview ? "block" : "none" }}
                />
              </div>

              <div className="buttons wide">
                <button className="btn primary" type="submit">
                  Save Product
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => {
                    resetForm();
                    showToast("Edit canceled");
                  }}
                >
                  Cancel
                </button>
                <button className="btn ghost" type="button" onClick={loadProducts}>
                  Refresh List
                </button>
              </div>
            </form>
          </section>

          <section className="glass-card">
            <div className="list-head">
              <h1>Products Management</h1>
              <div className="head-actions">
                <input
                  placeholder="Search products..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
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

              <div className="list">
                {filteredProducts.map((product) => {
                  const imageUrl = product.image_url ? toAbsoluteUploadUrl(product.image_url) : "";
                  const inStock = Number(product.stock) > 0;
                  return (
                    <div className="row-item" key={product.id}>
                      <div>
                        {imageUrl ? (
                          <img className="p-thumb" src={imageUrl} alt={product.name} />
                        ) : (
                          <div className="p-thumb p-thumb-fallback">{product.emoji || "Item"}</div>
                        )}
                      </div>
                      <div>
                        <div className="itemName">{product.name}</div>
                        <div className="itemMeta">{product.description || "No description"}</div>
                        <div className="itemMeta">
                          {product.category} - #{Number(product.id)}
                        </div>
                      </div>
                      <div>
                        <strong>{money(product.price)} MAD</strong>
                      </div>
                      <div>{Number(product.stock)}</div>
                      <div>
                        <span className={`pill ${inStock ? "ok" : "bad"}`}>{inStock ? "Active" : "Out"}</span>
                      </div>
                      <div className="itemActions">
                        <button className="btn primary" type="button" onClick={() => startEdit(product)}>
                          Edit
                        </button>
                        <button className="btn ghost" type="button" onClick={() => deleteProduct(product.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="empty" hidden={filteredProducts.length !== 0}>
              No products found.
            </div>
          </section>

          <section className="glass-card">
            <div className="list-head">
              <h2>Orders</h2>
              <button className="btn ghost" type="button" onClick={loadOrders}>
                Load Orders
              </button>
            </div>

            <div className="orders">
              {orders.map((order) => {
                const phone = String(order.phone || "").replace(/\s+/g, "");
                const whatsappLink = phone ? `https://wa.me/${phone.replace(/^0/, "212")}` : "";

                return (
                  <div className="item" key={order.id}>
                    <div className="itemTop">
                      <div>
                        <div className="itemName">
                          Order #{order.id} <span className="pill">{String(order.status || "NEW")}</span>
                        </div>
                        <div className="itemMeta">
                          {order.customer_name} - {order.phone}
                        </div>
                        <div className="itemMeta">{order.address}</div>
                        {order.notes ? <div className="itemMeta">Notes: {order.notes}</div> : null}
                      </div>
                      <div className="order-total">{money(order.total)} MAD</div>
                    </div>

                    <div className="itemActions">
                      {whatsappLink ? (
                        <a className="btn primary" target="_blank" rel="noreferrer" href={whatsappLink}>
                          WhatsApp
                        </a>
                      ) : null}

                      {["CONFIRMED", "SHIPPED", "DONE", "CANCELED"].map((status) => (
                        <button
                          key={status}
                          className="btn ghost"
                          type="button"
                          onClick={() => updateOrderStatus(order.id, status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <div className="itemMeta orders-items">Items: {String(order.items_json || "")}</div>
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

