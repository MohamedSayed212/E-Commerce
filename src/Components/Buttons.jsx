import React, { useContext } from "react";
import { FaHeart } from "react-icons/fa"; // make sure you import this
import { CartContext } from "./Context/CartContext";
import { FavouriteContext } from "./Context/FavouriteContext";
function Buttons({ product }) {
  // Read addToCart function from global context.
  const { cartItems, addToCart, increaseQty, decreaseQty } =
    useContext(CartContext);

  const { addToFavourites, favourites, removeFromFavourites } =
    useContext(FavouriteContext);
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
    <div className=" h-[50px] sm:mt-[23px]  flex gap-1">
      {/* Add to Cart */}
      {!cartItem ? (
        // ➕ ADD TO CART
        <button
          className="flex-1 cursor-pointer rounded-lg py-2 text-[15px] text-white bg-primary hover:bg-primaryHover transition duration-200"
          onClick={() => addToCart(product)}
          disabled={!product}
        >
          Add to Cart
        </button>
      ) : (
        // 🔢 COUNTER UI
        <div className="flex flex-1 items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-2 dark:border-gray-600 dark:bg-gray-800">
          <button
            onClick={() => decreaseQty(product.id)}
            className="px-3 py-1 text-center  text-black rounded-md"
          >
            -
          </button>

          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {cartItem.qty}
          </span>

          <button
            onClick={() => increaseQty(product.id)}
            className="px-3 py-1  duration-200 text-black rounded-md"
          >
            +
          </button>
        </div>
      )}

      {/* Favorite */}
      <button
        onClick={toggleFavourite}
        className={`flex cursor-pointer items-center  justify-center rounded-lg  border p-3 transition duration-200
    ${
      isFavourite
        ? "border-primary bg-primaryHover"
        : "border-gray-300 hover:bg-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
    }
  `}
      >
        <FaHeart
          className={`text-xl ${isFavourite ? "text-white" : "text-gray-600 dark:text-gray-300"}`}
        />
      </button>
    </div>
  );
}

export default Buttons;
