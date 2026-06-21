import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiShoppingBagLine,
  RiLayoutGridLine,
  RiShoppingCartLine,
  RiUserLine,
  RiBarChartLine,
  RiSettings3Line,
  RiStoreLine,
  RiLogoutBoxLine,
} from "react-icons/ri";
import { useAdminAuth } from "../AdminAuthContext";

const navLinks = [
  { to: "/admin",            icon: RiDashboardLine,    label: "Dashboard",  end: true },
  { to: "/admin/products",   icon: RiShoppingBagLine,  label: "Products" },
  { to: "/admin/categories", icon: RiLayoutGridLine,   label: "Categories" },
  { to: "/admin/orders",     icon: RiShoppingCartLine, label: "Orders" },
  { to: "/admin/customers",  icon: RiUserLine,         label: "Customers" },
  { to: "/admin/analytics",  icon: RiBarChartLine,     label: "Analytics" },
];

// isOpen  — whether the mobile drawer is visible
// onClose — called when the user taps the backdrop or a nav link on mobile
export default function Sidebar({ isOpen, onClose }) {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-primary text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  const initial = admin?.full_name?.[0]?.toUpperCase() || "A";

  return (
    <>
      {/*
        Dark backdrop — only visible on mobile when the drawer is open.
        Clicking it closes the sidebar.
      */}
      {/*
        Backdrop: z-30 so it sits above the sticky TopBar (z-10) and
        covers the entire content area when the mobile drawer is open.
      */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/*
        The sidebar itself.

        Mobile: starts off-screen to the left (-translate-x-full).
                Slides in (translate-x-0) when isOpen is true.
        Desktop (lg+): always visible (lg:translate-x-0 overrides the mobile state).

        z-40: above the backdrop (z-30) so the panel is always clickable.
        max-w-[85vw]: safety cap for very narrow screens (<283 px).
      */}
      <aside
        className={`
          fixed left-0 top-0 z-40 w-60 max-w-[85vw] h-screen bg-gray-900 border-r border-gray-800
          flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-800 flex-shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <RiStoreLine className="text-white text-lg" />
          </div>
          <span className="text-white font-semibold">Admin Panel</span>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={linkClass}
              onClick={onClose}  // close drawer when navigating on mobile
            >
              <Icon className="text-lg flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: settings, view store, user info, logout */}
        <div className="px-3 py-4 border-t border-gray-800 space-y-0.5 flex-shrink-0">
          <NavLink to="/admin/settings" className={linkClass} onClick={onClose}>
            <RiSettings3Line className="text-lg flex-shrink-0" />
            Settings
          </NavLink>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <RiStoreLine className="text-lg flex-shrink-0" />
            View Store
          </a>

          <div className="pt-3 mt-1 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary text-sm font-semibold">{initial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {admin?.full_name || "Admin"}
                </p>
                <p className="text-gray-500 text-xs truncate">{admin?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <RiLogoutBoxLine className="text-lg" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
