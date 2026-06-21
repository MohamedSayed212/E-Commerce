import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useAdminAuth } from "../AdminAuthContext";

export default function AdminLayout() {
  const { admin, loading } = useAdminAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
    Lock body scroll while the mobile sidebar is open so the background
    page cannot be scrolled (horizontally or vertically) behind the overlay.
    Cleanup runs on unmount and every time sidebarOpen changes.
  */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

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
    /*
      Root is a plain BLOCK container (not flex).
      Reasons:
        • flex containers can cause min-width:auto bugs where a flex child
          refuses to shrink below its content, making the page wider than
          the viewport even when the sidebar is position:fixed (out of flow).
        • A block root + overflow-x:hidden is the simplest, most
          browser-compatible way to guarantee no horizontal scroll.
    */
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">

      {/* Fixed sidebar — overlays content on mobile, always visible on lg+ */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/*
        Content wrapper.
        - Block element → takes 100 % of the root width by default (no flex quirks).
        - lg:pl-60  → on desktop, indent 240 px from the left to clear the
          fixed sidebar. On mobile there is no indent; the sidebar overlays.
        - overflow-x:hidden → second safety net so nothing inside can widen
          this div beyond the viewport.
      */}
      <div className="lg:pl-60 min-h-screen flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
