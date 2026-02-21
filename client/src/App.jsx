import { Navigate, Route, Routes } from "react-router-dom";
import ProductsPage from "./pages/Products";
import ProductDetailsPage from "./pages/ProductDetails";
import AdminPage from "./pages/Admin";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/product" element={<Navigate to="/products" replace />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
