import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAdminAuth } from "../AdminAuthContext";

export default function AdminLayout() {
  const { admin, loading } = useAdminAuth();

  // Controls the mobile sidebar drawer (open/closed)
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 min-h-screen">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/*
        lg:ml-60 — on large screens the sidebar is always visible so we
        push content to the right. On mobile the sidebar is a drawer overlay
        so we don't push the content at all.
        min-w-0 is required: without it flex children default to
        min-width:auto and the content div refuses to shrink below the
        natural width of any inner table, causing page-level horizontal scroll.
      */}
      <div className="flex-1 min-w-0 lg:ml-60 flex flex-col min-h-screen overflow-x-hidden">
        <TopBar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
