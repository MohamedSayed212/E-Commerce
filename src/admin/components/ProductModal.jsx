import React, { useState, useEffect, useRef } from "react";
import {
  RiCloseLine,
  RiImageAddLine,
  RiLoader4Line,
} from "react-icons/ri";
import { supabase } from "../../lib/supabase";

// "iPhone 15 Pro" → "iphone-15-pro", "MacBook Air M4" → "macbook-air-m4"
const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/['']/g, "")          // strip apostrophes: "men's" → "mens"
    .replace(/[^a-z0-9]+/g, "-")  // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, "");     // trim leading/trailing hyphens

// Returns the base slug when it is free.
// If another product already uses it, appends a 4-char random suffix.
// excludeId: pass the current product.id on edit so a product never
// conflicts with its own existing slug.
const ensureUniqueSlug = async (name, excludeId = null) => {
  const base = generateSlug(name);

  let query = supabase
    .from("products")
    .select("id")
    .eq("slug", base)
    .limit(1);

  if (excludeId) query = query.neq("id", excludeId);

  const { data } = await query;

  if (!data || data.length === 0) return base;

  // Conflict — append a short random suffix and use that
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
};

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  compare_price: "",
  stock: "0",
  category_id: "",
  is_active: true,
};

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

const USD_TO_EGP = 50;

export default function ProductModal({ product, categories, onClose, onSaved }) {
  const isEditing = Boolean(product);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Each image is { url: string, file?: File }
  // url is a blob URL for new picks, or an existing Supabase URL for saved images
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price != null ? product.price * USD_TO_EGP : "",
        compare_price: product.compare_price != null ? product.compare_price * USD_TO_EGP : "",
        stock: product.stock ?? 0,
        category_id: product.category_id || "",
        is_active: product.is_active ?? true,
      });
      const existing = product.images?.length > 0 ? product.images : [];
      setImages(existing.map((url) => ({ url })));
    } else {
      setForm(EMPTY_FORM);
      setImages([]);
    }
    setErrors({});
  }, [product]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setImages((prev) => [...prev, ...newImages]);
    // Reset so the same file can be picked again if needed
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Product name is required.";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      errs.price = "Enter a valid price greater than 0.";
    if (form.stock === "" || isNaN(form.stock) || Number(form.stock) < 0)
      errs.stock = "Stock must be 0 or more.";
    return errs;
  };

  const logError = (label, error) => {
    console.error(`--- ${label} ---`);
    console.error("error        :", error);
    console.error("error.code   :", error?.code);
    console.error("error.message:", error?.message);
    console.error("error.details:", error?.details);
    console.error("error.hint   :", error?.hint);
  };

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { contentType: file.type });
    if (error) {
      logError("storage.objects INSERT (uploadImage)", error);
      throw error;
    }
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);
    console.log("[uploadImage] uploaded file:", fileName);
    console.log("[uploadImage] public URL returned:", publicUrl);
    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Upload new images; keep existing URLs unchanged
      const finalUrls = [];
      for (const img of images) {
        if (img.file) {
          const url = await uploadImage(img.file);
          finalUrls.push(url);
        } else {
          finalUrls.push(img.url);
        }
      }

      // Generate slug from name; exclude current product on edit so it
      // doesn't conflict with its own existing slug when the name is unchanged.
      const slug = await ensureUniqueSlug(
        form.name.trim(),
        isEditing ? product.id : null
      );

      console.log("[handleSubmit] finalUrls to save:", finalUrls);

      const payload = {
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        price: Number(form.price) / USD_TO_EGP,
        compare_price: form.compare_price !== "" ? Number(form.compare_price) / USD_TO_EGP : null,
        stock: Number(form.stock),
        category_id: form.category_id || null,
        images: finalUrls,
        is_active: form.is_active,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) {
          logError("products UPDATE", error);
          throw error;
        }
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) {
          logError("products INSERT", error);
          throw error;
        }
      }

      onSaved();
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={!saving ? onClose : undefined}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="font-semibold text-gray-900 text-base">
            {isEditing ? "Edit Product" : "Add Product"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondaryHover transition text-secondary disabled:opacity-40"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 px-6 py-5 space-y-5"
        >
          {/* ── Images ─────────────────────────────────────────── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Images
              <span className="text-xs font-normal text-secondary ml-1.5">
                — first image is used as thumbnail
              </span>
            </label>

            <div className="grid grid-cols-4 gap-2">
              {/* Uploaded image tiles */}
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-gray-50"
                >
                  <img
                    src={img.url}
                    alt={`product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* "MAIN" label on the first image */}
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] font-semibold px-1.5 py-0.5 rounded leading-tight">
                      MAIN
                    </span>
                  )}

                  {/* Remove button — visible on hover */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <RiCloseLine className="text-xs" />
                  </button>
                </div>
              ))}

              {/* Add-more tile */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-secondary hover:border-primary hover:text-primary transition"
              >
                <RiImageAddLine className="text-2xl" />
                <span className="text-[11px] font-medium">Add</span>
              </button>
            </div>

            {/* Hidden file input — multiple allowed */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ── Name ───────────────────────────────────────────── */}
          <Field label="Product Name *" error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. iPhone 15 Pro"
              className={inputClass}
            />
          </Field>

          {/* ── Description ────────────────────────────────────── */}
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Short product description..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {/* ── Sale Price + Original Price ─────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sale Price (EGP) *" error={errors.price}>
              <input
                type="number"
                step="1"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className={inputClass}
              />
            </Field>
            <Field label="Original Price (EGP)">
              <input
                type="number"
                step="1"
                min="0"
                value={form.compare_price}
                onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
                placeholder="0"
                className={inputClass}
              />
            </Field>
          </div>

          {/* ── Stock ──────────────────────────────────────────── */}
          <Field label="Stock *" error={errors.stock}>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="0"
              className={inputClass}
            />
          </Field>

          {/* ── Active toggle ───────────────────────────────────── */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium text-gray-700">Active</p>
              <p className="text-xs text-secondary mt-0.5">Inactive products are hidden from the storefront.</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.is_active ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.is_active ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* ── Category ───────────────────────────────────────── */}
          <Field label="Category">
            <select
              value={form.category_id}
              onChange={(e) =>
                setForm({ ...form, category_id: e.target.value })
              }
              className={inputClass}
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Submit-level error */}
          {errors.submit && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {errors.submit}
            </p>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-secondary hover:bg-secondaryHover transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primaryHover transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving && <RiLoader4Line className="animate-spin" />}
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
