import { useContext } from "react";
import { CartContext } from "./Context/CartContext";
import { Link } from "react-router-dom";

function CartPage() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty, cartTotal } =
    useContext(CartContext);

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto flex h-[70vh] items-center justify-center text-lg text-gray-500 dark:text-gray-400">
        Your cart is empty 🛒
      </div>
    );
  }

  return (
    <div className="sm:container mx-auto mt-[-10px] xs:p-3 sm:p-4 md:p-6">
      <h1 className="   xs:mb-4 md:mb-8  xs:text-2xl  md:text-3xl lg:text-4xl font-bold text-primary">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* LEFT - ITEMS */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center justify-between rounded-xl bg-white p-4 shadow-md transition hover:shadow-lg  sm:flex-row"
            >
              {/* Product Info */}
              <div className="flex items-center xs:gap-3 sm:gap-5 w-full sm:w-auto">
                <img
                  src={item.thumbnail || item.image}
                  alt={item.title}
                  className="w-24 xs:h-20 sm:h-24 object-cover rounded-lg"
                />

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 md:text-xl">
                    {item.title}
                  </h2>
                  <p className="text-primary font-bold text-lg">
                    ${item.price}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center  gap-3 mt-4 sm:mt-0">
                <button
                  onClick={() => decreaseQty(item.id)}
                  className="px-4 py-1 bg-secondary hover:bg-secondaryHover text-white rounded-md text-lg"
                >
                  -
                </button>

                <span className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {item.qty}
                </span>

                <button
                  onClick={() => increaseQty(item.id)}
                  className="px-4 py-1 bg-primary hover:bg-primaryHover text-white rounded-md text-lg"
                >
                  +
                </button>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-4 text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="sticky top-6 h-fit rounded-xl bg-white p-6 shadow-md dark:bg-gray-900 dark:shadow-black/40">
          <h2 className="mb-6 text-2xl font-bold text-secondary dark:text-gray-200">
            Order Summary
          </h2>

          <div className="mb-4 flex justify-between text-lg text-gray-800 dark:text-gray-200">
            <span>Total Items</span>
            <span>{cartItems.reduce((sum, item) => sum + item.qty, 0)}</span>
          </div>

          <div className="mb-6 flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
            <span>Total</span>
            <span className="text-primary">${cartTotal.toFixed(2)}</span>
          </div>

          <Link to="/checkout">
            <button className="w-full h-[50px] bg-primary hover:bg-primaryHover text-white rounded-lg text-lg transition">
              Check Out
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CartPage;
