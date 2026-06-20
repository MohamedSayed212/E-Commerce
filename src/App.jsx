import React from "react";
import Header from "./Components/Header";
import Home from "./pages/Home";
import { Routes, Route, useLocation } from "react-router-dom";

import ProductDetails from "./Components/ProductDetails.jsx";
import ScrollToTop from "./Components/ScrollToTop";
import CartSideBar from "./Components/CartSideBar.jsx";
import AddToCartToast from "./Components/AddToCartToast";
import CartPage from "./Components/CartPage.jsx";
import FavouritePage from "./pages/FavouritePage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrderSuccessPage from "./pages/OrderSuccessPage.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";

// Admin
import AdminLayout from "./admin/components/AdminLayout";
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import DashboardPage from "./admin/pages/DashboardPage";
import ProductsPage from "./admin/pages/ProductsPage";
import CategoriesPage from "./admin/pages/CategoriesPage";
import OrdersPage from "./admin/pages/OrdersPage";
import OrderDetailPage from "./admin/pages/OrderDetailPage";
import CustomersPage from "./admin/pages/CustomersPage";
import AnalyticsPage from "./admin/pages/AnalyticsPage";
import SettingsPage from "./admin/pages/SettingsPage";

function App() {
  const location = useLocation();

  // Hide the store header/cart on auth pages AND all admin pages
  const hideHeader =
    location.pathname === "/signin" ||
    location.pathname === "/signup" ||
    location.pathname.startsWith("/admin");

  return (
    <div>
      {!hideHeader && <Header />}
      {!hideHeader && <CartSideBar />}
      {!hideHeader && <AddToCartToast />}
      <ScrollToTop />

      <div className={!hideHeader ? "mt-[200px]" : ""}>
        <Routes>
          {/* Store routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favourite" element={<FavouritePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<LogInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin login — outside AdminLayout so it has its own dark design */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected admin routes — AdminLayout checks auth and renders sidebar */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

export default App;
