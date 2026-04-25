import React, { useContext, useState } from "react";
import { CartContext } from "../Components/Context/CartContext";

function CheckoutPage() {
  // =========================
  // 1. CART DATA (from Context)
  // =========================
  const { cartTotal } = useContext(CartContext);

  // =========================
  // 2. SHIPPING STATE
  // =========================
  const [shipping, setShipping] = useState(50);

  // Final total = cart total + shipping
  const total = cartTotal + shipping;

  // =========================
  // 3. FORM STATE
  // =========================
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
    payment: "cod",
  });

  // =========================
  // 4. ERROR STATE (validation)
  // =========================
  const [errors, setErrors] = useState({});

  // =========================
  // 5. SUCCESS POPUP STATE
  // =========================
  const [showPopup, setShowPopup] = useState(false);

  // ----------------------------
  // Dark mode friendly inputs
  // ----------------------------
  // We write the long Tailwind classes once, then reuse on every input.
  // That way light mode + dark mode stay consistent and the file is easier to read.
  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // update form
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // remove error when user starts typing again
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================
  // FORM VALIDATION
  // =========================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.address) newErrors.address = "Address is required";

    setErrors(newErrors);

    // valid only if no errors
    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // PLACE ORDER
  // =========================
  const handleOrder = () => {
    // prevent empty cart
    if (cartTotal === 0) return;

    // validate form
    const isValid = validateForm();
    if (!isValid) return;

    // log order (later replace with API)
    console.log("ORDER DATA:", {
      formData,
      subtotal: cartTotal,
      shipping,
      total,
    });

    // show success popup
    setShowPopup(true);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 px-4 py-10 dark:bg-gray-950">
      {/* =========================
          MAIN CONTAINER
      ========================= */}
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-md dark:bg-gray-900 dark:shadow-black/40 md:p-10">
        <h2 className="mb-8 text-3xl font-bold text-gray-800 dark:text-gray-100">
          Checkout
        </h2>

        {/* =========================
            CONTACT INFO
        ========================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
            Contact Info
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* NAME */}
            <div>
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                className={`${inputClass} ${
                  errors.name ? "border-red-500 dark:border-red-500" : ""
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <input
                name="email"
                placeholder="Email Address"
                onChange={handleChange}
                className={`${inputClass} ${
                  errors.email ? "border-red-500 dark:border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* PHONE */}
            <div>
              <input
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
                className={`${inputClass} ${
                  errors.phone ? "border-red-500 dark:border-red-500" : ""
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* CITY */}
            <input
              name="city"
              placeholder="City"
              onChange={handleChange}
              className={inputClass}
            />
          </div>
        </div>

        {/* =========================
            ADDRESS
        ========================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
            Shipping Address
          </h3>

          {/* ADDRESS INPUT */}
          <div>
            <input
              name="address"
              placeholder="Full Address"
              onChange={handleChange}
              className={`${inputClass} mb-2 ${
                errors.address ? "border-red-500 dark:border-red-500" : ""
              }`}
            />

            {errors.address && (
              <p className="text-red-500 text-sm mb-4">{errors.address}</p>
            )}
          </div>

          {/* NOTES */}
          <textarea
            name="notes"
            placeholder="Order notes (optional)"
            onChange={handleChange}
            className={`${inputClass} h-[150px] resize-none`}
          />
        </div>

        {/* =========================
            DELIVERY OPTIONS
        ========================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
            Delivery Method
          </h3>

          <div className="space-y-3">
            <label className="flex cursor-pointer justify-between rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800/40 dark:text-gray-200">
              <span>Standard Delivery (3-5 days)</span>
              <input
                type="radio"
                checked={shipping === 50}
                onChange={() => setShipping(50)}
              />
            </label>

            <label className="flex cursor-pointer justify-between rounded-lg border border-gray-300 p-4 dark:border-gray-600 dark:bg-gray-800/40 dark:text-gray-200">
              <span>Express Delivery (1-2 days)</span>
              <input
                type="radio"
                checked={shipping === 100}
                onChange={() => setShipping(100)}
              />
            </label>
          </div>
        </div>

        {/* =========================
            PAYMENT METHOD
        ========================= */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
            Payment Method
          </h3>

          <select name="payment" onChange={handleChange} className={inputClass}>
            <option value="cod">Cash on Delivery</option>
            <option value="card">Credit Card</option>
          </select>
        </div>

        {/* =========================
            ORDER SUMMARY
        ========================= */}
        <div className="space-y-4 border-t border-gray-200 pt-6 text-lg text-gray-800 dark:border-gray-700 dark:text-gray-200">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-4 text-xl font-semibold dark:border-gray-700">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* =========================
            ORDER BUTTON
        ========================= */}
        <button
          onClick={handleOrder}
          className="mt-8 w-full rounded-xl bg-black py-4 text-lg text-white transition hover:opacity-90 dark:bg-primary dark:hover:bg-primaryHover"
        >
          Confirm Order
        </button>
      </div>

      {/* =========================
          SUCCESS POPUP
      ========================= */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 text-center shadow-xl dark:bg-gray-900 dark:shadow-black/50">
            <div className="text-4xl mb-3">🎉</div>

            <h2 className="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Order Confirmed!
            </h2>

            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Your order has been placed successfully. We will contact you soon.
            </p>

            <button
              onClick={() => setShowPopup(false)}
              className="rounded-lg bg-black px-6 py-2 text-white hover:opacity-90 dark:bg-primary dark:hover:bg-primaryHover"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
