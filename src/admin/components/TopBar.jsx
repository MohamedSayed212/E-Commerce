import React from "react";
import { useLocation } from "react-router-dom";
import { RiMenu2Line } from "react-icons/ri";

const pageTitles = {
  "/admin":            "Dashboard",
  "/admin/products":   "Products",
  "/admin/categories": "Categories",
  "/admin/orders":     "Orders",
  "/admin/customers":  "Customers",
  "/admin/analytics":  "Analytics",
  "/admin/settings":   "Settings",
};

// onMenuClick — called when the hamburger button is tapped on mobile
export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Admin";

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 md:px-6 sticky top-0 z-10 flex-shrink-0 gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-secondary hover:text-gray-900 hover:bg-secondaryHover dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800 transition duration-200"
        aria-label="Open menu"
      >
        <RiMenu2Line className="text-xl" />
      </button>

      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h1>
    </header>
  );
}
