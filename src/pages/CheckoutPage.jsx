import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../Components/Context/CartContext";
import { AuthContext } from "../Components/Context/AuthContext";
import { supabase } from "../lib/supabase";
import { formatEGP } from "../lib/currency";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  // shipping is stored in EGP (50 or 100). Divide by 50 to get USD for DB total.
  const [shipping, setShipping] = useState(50);
  const total = cartTotal + shipping / 50;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
    payment: "cod",
  });

  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOrder = async () => {
    if (cartItems.length === 0) return;
    if (!validateForm()) return;

    // Require login so the order is linked to a user account
    if (!user) {
      navigate("/signin?redirect=/checkout");
      return;
    }

    setPlacing(true);
    setOrderError("");

    try {
      // ── Log cart items so we can see what IDs are in the cart ─────────
      console.log(
        "[Checkout] cartItems:",
        cartItems.map((i) => ({
          id: i.id,
          title: i.title ?? i.name,
          price: i.price,
          qty: i.qty,
          idIsUUID: isUUID(i.id),
        }))
      );

      // ── Step 1: verify which cart item UUIDs actually exist in DB ──────
      // A UUID can be in localStorage from before a re-seed; those UUIDs no
      // longer reference any product row and would cause a FK violation.
      const uuidCandidates = cartItems
        .filter((i) => isUUID(i.id))
        .map((i) => i.id);

      let validProductIds = new Set();

      if (uuidCandidates.length > 0) {
        const { data: found, error: lookupErr } = await supabase
          .from("products")
          .select("id")
          .in("id", uuidCandidates);

        if (lookupErr) {
          console.error("[Checkout] product lookup error:", lookupErr);
        } else {
          validProductIds = new Set((found || []).map((p) => p.id));
          console.log("[Checkout] valid product UUIDs in DB:", [...validProductIds]);
        }
      }

      // ── Step 2: create the order row ──────────────────────────────────
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          status: "pending",
          shipping_address: {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            city: formData.city.trim(),
            address: formData.address.trim(),
            notes: formData.notes.trim(),
            delivery: shipping === 50 ? "Standard" : "Express",
            payment: formData.payment,
          },
        })
        .select("id")
        .single();

      if (orderErr) {
        console.error("[Checkout] order insert error:", orderErr);
        throw new Error(`Order failed: ${orderErr.message}`);
      }

      // ── Step 3: insert every cart item into order_items ───────────────
      // product_id is set only when the UUID exists in the products table.
      // DummyJSON products (numeric IDs) and stale UUIDs both fall back to null.
      const items = cartItems.map((item) => {
        const productId = validProductIds.has(item.id) ? item.id : null;
        console.log("[Checkout] order_item →", {
          item_id: item.id,
          product_id: productId,
          qty: item.qty,
          price: item.price,
        });
        return {
          order_id: order.id,
          product_id: productId,
          product_name: item.title ?? item.name ?? null,
          product_image: item.thumbnail ?? item.images?.[0] ?? null,
          quantity: item.qty,
          price: item.price,
        };
      });

      console.log("[Checkout] inserting order_items:", items);

      const { error: itemsErr } = await supabase
        .from("order_items")
        .insert(items);

      if (itemsErr) {
        console.error("[Checkout] order_items insert error:", itemsErr);
        throw new Error(`Order items failed: ${itemsErr.message}`);
      }

      // ── Step 4: success ───────────────────────────────────────────────
      clearCart();
      navigate(`/order-success?id=${order.id}`);
    } catch (err) {
      console.error("[Checkout] error:", err);
      setOrderError(err.message || "Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700 mb-4">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primaryHover transition"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md md:p-10">
        <h2 className="mb-8 text-3xl font-bold text-gray-800">Checkout</h2>

        {/* ── Contact Info ──────────────────────────────────────────── */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Contact Info</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`${inputClass} ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={`${inputClass} ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className={`${inputClass} ${errors.phone ? "border-red-500" : ""}`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* ── Shipping Address ──────────────────────────────────────── */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Shipping Address</h3>
          <div>
            <input
              name="address"
              placeholder="Full Address"
              value={formData.address}
              onChange={handleChange}
              className={`${inputClass} mb-2 ${errors.address ? "border-red-500" : ""}`}
            />
            {errors.address && <p className="text-red-500 text-sm mb-3">{errors.address}</p>}
          </div>
          <textarea
            name="notes"
            placeholder="Order notes (optional)"
            value={formData.notes}
            onChange={handleChange}
            className={`${inputClass} h-[130px] resize-none`}
          />
        </div>

        {/* ── Delivery Method ───────────────────────────────────────── */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Delivery Method</h3>
          <div className="space-y-3">
            <label className="flex cursor-pointer justify-between rounded-lg border border-gray-300 p-4">
              <div>
                <p className="font-medium text-gray-800">Standard Delivery</p>
                <p className="text-sm text-gray-500">3–5 business days</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">50 EGP</span>
                <input
                  type="radio"
                  checked={shipping === 50}
                  onChange={() => setShipping(50)}
                />
              </div>
            </label>

            <label className="flex cursor-pointer justify-between rounded-lg border border-gray-300 p-4">
              <div>
                <p className="font-medium text-gray-800">Express Delivery</p>
                <p className="text-sm text-gray-500">1–2 business days</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">100 EGP</span>
                <input
                  type="radio"
                  checked={shipping === 100}
                  onChange={() => setShipping(100)}
                />
              </div>
            </label>
          </div>
        </div>

        {/* ── Payment Method ────────────────────────────────────────── */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700">Payment Method</h3>
          <select name="payment" onChange={handleChange} className={inputClass}>
            <option value="cod">Cash on Delivery</option>
            <option value="card">Credit Card</option>
          </select>
        </div>

        {/* ── Order Summary ─────────────────────────────────────────── */}
        <div className="space-y-4 border-t border-gray-200 pt-6 text-lg text-gray-800">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatEGP(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping} EGP</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-4 text-xl font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatEGP(total)}</span>
          </div>
        </div>

        {/* ── Error message ─────────────────────────────────────────── */}
        {orderError && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
            {orderError}
          </div>
        )}

        {/* ── Place Order button ────────────────────────────────────── */}
        <button
          onClick={handleOrder}
          disabled={placing}
          className="mt-6 w-full rounded-xl bg-primary py-4 text-lg font-semibold text-white transition hover:bg-primaryHover disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {placing ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Placing Order…
            </>
          ) : (
            "Place Order"
          )}
        </button>

        {!user && (
          <p className="mt-3 text-center text-sm text-gray-500">
            You need to{" "}
            <button
              onClick={() => navigate("/signin?redirect=/checkout")}
              className="text-primary underline"
            >
              sign in
            </button>{" "}
            before placing an order.
          </p>
        )}
      </div>
    </div>
  );
}

// Checks if a string is a valid UUID (Supabase product ID format)
function isUUID(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value)
  );
}

export default CheckoutPage;
