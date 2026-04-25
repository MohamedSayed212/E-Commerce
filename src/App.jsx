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
import CategoryPage from "./pages/CategoryPage.jsx";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LogInPage from "./pages/LogInPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const location = useLocation();

  // pages where you DON'T want header
  const hideHeader =
    location.pathname === "/signin" || location.pathname === "/signup";

  return (
    <div>
      {!hideHeader && <Header />}

      {!hideHeader && <CartSideBar />}
      {!hideHeader && <AddToCartToast />}
      <ScrollToTop />

      <div className={!hideHeader ? "mt-[200px]" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favourite" element={<FavouritePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<LogInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
