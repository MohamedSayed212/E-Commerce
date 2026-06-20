import React, { useState, useEffect } from "react";
import {
  RiAddLine,
  RiSearchLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiLayoutGridLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

// "Mobile Phones" → "mobile-phones", "Men's Shirts" → "mens-shirts"
const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/['']/g, "")         // strip apostrophes before replacing specials
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "");    // trim leading / trailing hyphens

export default function CategoriesPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = add mode
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (type, message) => setToast({ type, message });

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("id, name, created_at, products(count)")
      .order("name");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter client-side — category lists are small, no need for server-side search
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // --- Modal helpers ---
  const openAdd = () => {
    setEditingCategory(null);
    setFormName("");
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCategory(null);
    setFormName("");
    setFormError("");
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError("Category name is required.");
      return;
    }
    setSaving(true);
    setFormError("");

    if (editingCategory) {
      const trimmed = formName.trim();
      const { error } = await supabase
        .from("categories")
        .update({ name: trimmed, slug: generateSlug(trimmed) })
        .eq("id", editingCategory.id);

      if (error) {
        setFormError(
          error.code === "23505"
            ? "A category with this name already exists."
            : error.message
        );
        setSaving(false);
        return;
      }
      showToast("success", "Category updated.");
    } else {
      const trimmed = formName.trim();
      const { error } = await supabase
        .from("categories")
        .insert({ name: trimmed, slug: generateSlug(trimmed) });

      if (error) {
        setFormError(
          error.code === "23505"
            ? "A category with this name already exists."
            : error.message
        );
        setSaving(false);
        return;
      }
      showToast("success", "Category added.");
    }

    setSaving(false);
    setModalOpen(false);
    fetchCategories();
  };

  // Allow submitting the form with Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
  };

  // --- Delete ---
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deletingCategory.id);
    setDeleting(false);
    setDeletingCategory(null);

    if (error) {
      showToast("error", "Failed to delete category.");
    } else {
      showToast("success", "Category deleted.");
      fetchCategories();
    }
  };

  const getProductCount = (cat) => cat.products?.[0]?.count ?? 0;

  return (
    <div className="space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-secondary mt-0.5">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"} total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primaryHover transition duration-200 self-start sm:self-auto"
        >
          <RiAddLine className="text-base" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories…"
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {loading ? (
          /* Skeleton */
          <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 h-4 bg-gray-100 rounded w-40" />
                <div className="h-4 bg-gray-100 rounded w-20 hidden sm:block" />
                <div className="h-4 bg-gray-100 rounded w-24 hidden md:block" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RiLayoutGridLine className="text-3xl text-primary" />
            </div>
            <p className="font-semibold text-gray-900">
              {search ? "No categories found" : "No categories yet"}
            </p>
            <p className="text-sm text-secondary mt-1 max-w-xs">
              {search
                ? "Try a different search term."
                : "Add your first category to organise your products."}
            </p>
            {!search && (
              <button
                onClick={openAdd}
                className="mt-4 flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primaryHover transition"
              >
                <RiAddLine />
                Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider hidden sm:table-cell">
                    Products
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider hidden md:table-cell">
                    Created
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => {
                  const productCount = getProductCount(cat);
                  return (
                    <tr
                      key={cat.id}
                      className="border-b border-gray-100 hover:bg-secondaryHover transition duration-150 last:border-none"
                    >
                      {/* Category name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <RiLayoutGridLine className="text-primary text-base" />
                          </div>
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </div>
                      </td>

                      {/* Product count — click to view products filtered by this category */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {productCount > 0 ? (
                          <button
                            onClick={() =>
                              navigate(`/admin/products?category=${cat.id}`)
                            }
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition"
                          >
                            {productCount} product{productCount !== 1 ? "s" : ""} →
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-secondary">
                            0 products
                          </span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="px-6 py-4 text-secondary text-sm hidden md:table-cell">
                        {new Date(cat.created_at).toLocaleDateString("en-GB")}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEdit(cat)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:bg-blue-50 transition"
                            title="Edit category"
                          >
                            <RiPencilLine />
                          </button>
                          <button
                            onClick={() => setDeletingCategory(cat)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-red-500 hover:bg-red-50 transition"
                            title="Delete category"
                          >
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900 text-base">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondaryHover transition text-secondary"
              >
                <RiCloseLine className="text-xl" />
              </button>
            </div>

            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Smartphones"
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
              {formError && (
                <p className="text-xs text-red-500 mt-1.5">{formError}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-secondary hover:bg-secondaryHover transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primaryHover transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <RiLoader4Line className="animate-spin" />}
                {saving
                  ? "Saving…"
                  : editingCategory
                  ? "Save Changes"
                  : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingCategory && (
        <ConfirmModal
          title="Delete Category"
          message={
            getProductCount(deletingCategory) > 0
              ? `"${deletingCategory.name}" has ${getProductCount(deletingCategory)} product(s). Deleting it will remove the category from those products. This cannot be undone.`
              : `Are you sure you want to delete "${deletingCategory.name}"? This cannot be undone.`
          }
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingCategory(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
