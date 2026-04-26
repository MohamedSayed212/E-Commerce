import React, { useContext } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { CartContext } from "./Context/CartContext";
import { FavouriteContext } from "./Context/FavouriteContext";
function Buttons({ product, fullWidth = false, hideFavouriteOnMobile = false }) {
  // Read addToCart function from global context.
  const { cartItems, addToCart, increaseQty, decreaseQty } =
    useContext(CartContext);

  const { addToFavourites, favourites, removeFromFavourites } =
    useContext(FavouriteContext);

  if (!product) return null;

  // Chech Item in cart
  const cartItem = cartItems.find((item) => item.id === product.id);
  // check item in favourite
  const isFavourite = favourites.some((item) => item.id === product.id);
  //  logic when click again remove
  const toggleFavourite = () => {
    if (isFavourite) {
      removeFromFavourites(product.id);
    } else {
      addToFavourites(product);
    }
  };
  return (
    // ✅ You need to return the JSX
    <div className="flex min-h-[40px] w-full gap-2">
      {/* Add to Cart */}
      {!cartItem ? (
        // ➕ ADD TO CART
        <button
          type="button"
          className={`min-w-0 cursor-pointer rounded-lg bg-primary px-2 py-2 text-sm font-semibold text-white transition duration-200 hover:bg-primaryHover disabled:cursor-not-allowed disabled:opacity-60 sm:px-3 ${
            fullWidth ? "flex-[1_1_auto]" : "flex-1"
          }`}
          onClick={() => addToCart(product)}
        >
          <span className="block truncate">Add to Cart</span>
        </button>
      ) : (
        // 🔢 COUNTER UI
        <div
          className={`grid min-w-0 grid-cols-3 items-center rounded-lg border border-gray-300 bg-white p-1 dark:border-gray-600 dark:bg-gray-800 ${
            fullWidth ? "flex-[1_1_auto]" : "flex-1"
          }`}
        >
          <button
            type="button"
            onClick={() => decreaseQty(product.id)}
            className="flex h-8 min-w-0 items-center justify-center rounded-md text-lg leading-none text-gray-900 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
            aria-label="Decrease quantity"
          >
            -
          </button>

          <span className="flex h-8 min-w-0 items-center justify-center rounded-md px-1 text-center text-base font-semibold leading-none text-gray-900 dark:text-gray-100">
            {cartItem.qty}
          </span>

          <button
            type="button"
            onClick={() => increaseQty(product.id)}
            className="flex h-8 min-w-0 items-center justify-center rounded-md text-lg leading-none text-gray-900 transition hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      )}

      {/* Favorite */}
      <button
        type="button"
        onClick={toggleFavourite}
        aria-pressed={isFavourite}
        className={`${hideFavouriteOnMobile ? "hidden md:flex" : "flex"} h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white transition duration-200 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 ${
          fullWidth ? "w-11" : "w-9 sm:w-11"
        }`}
      >
        {isFavourite ? (
          <FaHeart className="text-lg text-red-500 sm:text-xl" />
        ) : (
          <FaRegHeart className="text-lg text-gray-500 dark:text-gray-300 sm:text-xl" />
        )}
      </button>
    </div>
  );
}

export default Buttons;
