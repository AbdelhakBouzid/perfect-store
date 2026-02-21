import { Navigate, Route, Routes } from "react-router-dom";
import ProductsPage from "./pages/Products";
import ProductDetailsPage from "./pages/ProductDetails";
import AdminPage from "./pages/Admin";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import CheckoutPage from "./pages/Checkout";
import ProfilePage from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import PolicyPage from "./pages/PolicyPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ProductsPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/product/:id" element={<ProductDetailsPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/privacy-policy" element={<PolicyPage policyKey="privacyPolicy" />} />
      <Route path="/terms-of-service" element={<PolicyPage policyKey="termsOfService" />} />
      <Route path="/refund-policy" element={<PolicyPage policyKey="refundPolicy" />} />
      <Route path="/shipping-policy" element={<PolicyPage policyKey="shippingPolicy" />} />
      <Route path="/product" element={<Navigate to="/products" replace />} />
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
