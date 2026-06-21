import React, { useState, useEffect } from "react";
import {
  RiAddLine,
  RiSearchLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiShoppingBagLine,
  RiCloseLine,
} from "react-icons/ri";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import ProductModal from "../components/ProductModal";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import PriceDisplay from "../../Components/PriceDisplay";

const PAGE_SIZE = 10;

function StockBadge({ stock }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        Out of stock
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
        Low ({stock})
      </span>
    );
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
      {stock} in stock
    </span>
  );
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  // Pre-select category if ?category=<id> is in the URL (navigated from CategoriesPage)
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || ""
  );
  const [page, setPage] = useState(1);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  // Fetch categories once on mount (used for filter dropdown and modal select)
  useEffect(() => {
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => setCategories(data || []));
  }, []);

  // Fetch products whenever search, filter, or page changes.
  // Search is debounced 350ms so we don't fire on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts(search, categoryFilter, page);
    }, 350);
    return () => clearTimeout(timeout);
  }, [search, categoryFilter, page]);

  const fetchProducts = async (searchVal, categoryVal, pageVal) => {
    setLoading(true);

    let query = supabase
      .from("products")
      .select("*, categories(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((pageVal - 1) * PAGE_SIZE, pageVal * PAGE_SIZE - 1);

    if (searchVal.trim()) query = query.ilike("name", `%${searchVal.trim()}%`);
    if (categoryVal) query = query.eq("category_id", categoryVal);

    const { data, count, error } = await query;
    if (!error) {
      console.log("[ProductsPage] fetched products:", data);
      data?.forEach((p) => {
        console.log(`  product "${p.name}" → images:`, p.images);
      });
      setProducts(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setPage(1);
  };

  // Modal handlers
  const handleAddClick = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleModalClose = () => {
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const handleProductSaved = () => {
    const wasEditing = Boolean(editingProduct);
    handleModalClose();
    fetchProducts(search, categoryFilter, page);
    showToast(
      "success",
      wasEditing ? "Product updated successfully." : "Product added successfully."
    );
  };

  // Delete handlers
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deletingProduct.id);
    setDeleting(false);
    setDeletingProduct(null);
    if (error) {
      showToast("error", "Failed to delete product.");
    } else {
      showToast("success", "Product deleted.");
      // If we deleted the last item on a page > 1, go back one page
      const newCount = totalCount - 1;
      const newTotalPages = Math.ceil(newCount / PAGE_SIZE);
      const newPage = page > newTotalPages && newTotalPages > 0 ? newTotalPages : page;
      setPage(newPage);
      fetchProducts(search, categoryFilter, newPage);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-5">
      {/* Toast notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            {/* Active category filter chip */}
            {categoryFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-primary border border-blue-200">
                {categories.find((c) => c.id === categoryFilter)?.name ?? "Category"}
                <button
                  onClick={() => handleCategoryChange("")}
                  className="ml-0.5 hover:text-primaryHover transition"
                  title="Clear filter"
                >
                  <RiCloseLine className="text-sm" />
                </button>
              </span>
            )}
          </div>
          <p className="text-sm text-secondary mt-0.5">
            {totalCount} product{totalCount !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primaryHover transition duration-200 self-start sm:self-auto"
        >
          <RiAddLine className="text-base" />
          Add Product
        </button>
      </div>

      {/* Search + Category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search products…"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition sm:w-52"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products table card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Loading skeleton */}
        {loading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-3 sm:px-6 py-4 animate-pulse"
              >
                <div className="w-11 h-11 bg-gray-100 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-48" />
                  <div className="h-3 bg-gray-100 rounded w-32" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-16" />
                <div className="h-6 bg-gray-100 rounded-full w-20 hidden sm:block" />
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RiShoppingBagLine className="text-3xl text-purple-400" />
            </div>
            <p className="font-semibold text-gray-900">
              {search || categoryFilter ? "No products found" : "No products yet"}
            </p>
            <p className="text-sm text-secondary mt-1 max-w-xs">
              {search || categoryFilter
                ? "Try adjusting your search or filter."
                : 'Click "Add Product" to add your first product.'}
            </p>
            {!search && !categoryFilter && (
              <button
                onClick={handleAddClick}
                className="mt-4 flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-primaryHover transition"
              >
                <RiAddLine />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider hidden md:table-cell">
                      Category
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider hidden sm:table-cell">
                      Stock
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-xs font-medium text-secondary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-secondaryHover transition duration-150 last:border-none"
                    >
                      {/* Product: thumbnail + name */}
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-gray-100"
                              onError={(e) => {
                                console.warn("[ProductsPage] image failed to load:", product.images[0]);
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0"
                            style={{ display: product.images?.[0] ? "none" : "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <RiShoppingBagLine className="text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-xs text-secondary truncate max-w-[200px] mt-0.5">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                        {product.categories?.name ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {product.categories.name}
                          </span>
                        ) : (
                          <span className="text-secondary text-xs">—</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-3 sm:px-6 py-4">
                        <PriceDisplay
                          price={product.price}
                          comparePrice={product.compare_price}
                          size="sm"
                        />
                      </td>

                      {/* Stock */}
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <StockBadge stock={product.stock} />
                      </td>

                      {/* Actions */}
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:bg-blue-50 transition"
                            title="Edit product"
                          >
                            <RiPencilLine />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-red-500 hover:bg-red-50 transition"
                            title="Delete product"
                          >
                            <RiDeleteBinLine />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-6 py-4 border-t border-gray-200">
                <p className="text-sm text-secondary">
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-secondary hover:bg-secondaryHover transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm font-medium text-gray-900 px-1">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-secondary hover:bg-secondaryHover transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={handleModalClose}
          onSaved={handleProductSaved}
        />
      )}

      {/* Delete confirmation modal */}
      {deletingProduct && (
        <ConfirmModal
          title="Delete Product"
          message={`Are you sure you want to delete "${deletingProduct.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingProduct(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
