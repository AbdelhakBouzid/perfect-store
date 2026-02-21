import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/Home";
import AdminPage from "./pages/Admin";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import ProductPage from "./pages/Product";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

