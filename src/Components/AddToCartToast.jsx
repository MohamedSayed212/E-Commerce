import React, { useContext } from "react";
import { CartContext } from "./Context/CartContext";

function AddToCartToast() {
  const { showAddToast, toastText } = useContext(CartContext);

  return (
    <div
      // Fixed popup at bottom-right.
      className={`pointer-events-none fixed bottom-6 right-6 z-[95] transition-all duration-300 ${
        showAddToast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <div className="rounded-xl border border-green-200 bg-white px-4 py-3 shadow-xl dark:border-green-900 dark:bg-gray-900 dark:shadow-black/50">
        <p className="text-sm font-medium text-secondary dark:text-gray-200">
          {toastText}
        </p>
      </div>
    </div>
  );
}

export default AddToCartToast;
