import React, { useContext } from "react";
import { CartContext } from "./Context/CartContext";
import { Link } from "react-router-dom";

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

      {/* Sidebar */}
      <aside
        className={`fixed right-0 top-0 xs:px-2 z-[80] flex h-full max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-900 dark:shadow-black/50 xs:w-[330px] md:w-[400px] ${
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

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      ${item.price} × {item.qty}
                    </p>

                    <p className="text-primary font-bold text-lg mt-1">
                      ${(item.price * item.qty).toFixed(2)}
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

        {/* Footer */}
        <div className="border-t h-[130px] border-gray-200 bg-white px-6 py-6 ">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-lg text-gray-600 dark:text-gray-400">
              Total
            </span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ${cartTotal.toFixed(2)}
            </span>
          </div>

          <Link to="/cart" onClick={() => setIsCartOpen(false)}>
            <button className=" xs:w-[150px]  md:w-[200px]   md:h-[50px] py-2 rounded-[10px]  xs:ml-[75px]  md:ml-[80px] bg-primary hover:bg-primaryHover text-white text-lg font-semibold transition">
              View Cart
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default CartSideBar;
