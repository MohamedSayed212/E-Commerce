import React, { useContext } from "react";
import { CartContext } from "./Context/CartContext";
import { Link } from "react-router-dom";
import PriceDisplay from "./PriceDisplay";
import { formatEGP } from "../lib/currency";

function CartSideBar() {
  const {
    cartItems,
    removeFromCart,
    increaseQty,
    decreaseQty,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
  } = useContext(CartContext);

  return (
    <>
      {/* Overlay (simple) */}
      <div
        className={`fixed inset-0 z-[70] bg-black/40 transition ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar — full width on very small screens, fixed width at sm+ */}
      <aside
        className={`fixed right-0 top-0 z-[80] flex h-full flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 dark:shadow-black/50 w-full sm:w-[330px] md:w-[400px] ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 dark:border-gray-700">
          <h2 className=" xs:font-medium md:font-semibold  text-2xl font-semibold text-gray-900 dark:text-white">
            Your Cart
          </h2>

          <button
            onClick={() => setIsCartOpen(false)}
            className="text-xl text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-1 py-3 space-y-3">
          {cartItems.length === 0 ? (
            <div className="flex h-full items-center justify-center text-lg text-gray-400 dark:text-gray-500">
              Your cart is empty 🛒
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-5 border-b border-gray-200 xs:pb-2 sm:pb-5 last:border-none dark:border-gray-700"
              >
                {/* Image */}
                <img
                  src={item.thumbnail || item.images?.[0]}
                  alt={item.title}
                  className=" xs:w-16 xs:h-20  md:w-24 mdh-24 object-cover rounded-xl"
                />

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className=" xs:text-[15px] text-lg font-semibold leading-snug text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h3>

                    <div className="mt-1">
                      <PriceDisplay
                        price={item.price}
                        comparePrice={item.compare_price}
                        size="sm"
                      />
                    </div>

                    <p className="text-secondary text-xs mt-1">
                      × {item.qty} = {formatEGP(item.price * item.qty)}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity */}
                    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        −
                      </button>

                      <span className="px-4 text-md font-medium text-gray-900 dark:text-gray-100">
                        {item.qty}
                      </span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        className="px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        +
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-sm mr-4 text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — full-width button replaces the hardcoded ml-[60px] positioning hack */}
        <div className="border-t border-gray-200 bg-white px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg text-gray-600 dark:text-gray-400">
              Total
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {formatEGP(cartTotal)}
            </span>
          </div>

          <Link to="/cart" onClick={() => setIsCartOpen(false)} className="block w-full">
            <button className="w-full py-3 rounded-[10px] bg-primary hover:bg-primaryHover text-white text-lg font-semibold transition">
              View Cart
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default CartSideBar;
