import React, { useContext } from "react";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import Buttons from "../Buttons";
import { FavouriteContext } from "../Context/FavouriteContext";

function Product({ product }) {
  const { addToFavourites, favourites, removeFromFavourites } =
    useContext(FavouriteContext);

  if (!product) return null;

  const title = product.title ?? "Product";
  const price = product.price;
  const rating = typeof product.rating === "number" ? product.rating : null;
  const image = product.thumbnail ?? product.images?.[0];
  const isFavourite = favourites.some((item) => item.id === product.id);

  const toggleFavourite = () => {
    if (isFavourite) {
      removeFromFavourites(product.id);
    } else {
      addToFavourites(product);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[240px] flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/40">
      <button
        type="button"
        onClick={toggleFavourite}
        className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/95 shadow-sm transition duration-200 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/95 dark:hover:bg-gray-800 md:hidden"
        aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
        aria-pressed={isFavourite}
      >
        {isFavourite ? (
          <FaHeart className="text-lg text-red-500" />
        ) : (
          <FaRegHeart className="text-lg text-gray-500 dark:text-gray-200" />
        )}
      </button>

      {/* 🔹 Image */}
      <div className="mb-4 flex h-[118px] w-full items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-3 dark:bg-gray-800/70 sm:h-[140px] md:h-[154px]">
        <Link
          to={`/products/${product.id}`}
          className="flex h-full w-full items-center justify-center"
        >
          {image && (
            <img
              src={image}
              alt={title}
              className="h-full max-h-full w-full max-w-full object-contain transition duration-200 hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          )}
        </Link>
      </div>

      {/* 🔹 Info */}
      <div className="flex flex-col text-left">
        {/* Title */}
        <Link to={`/products/${product.id}`} className="min-w-0">
          <h3
            className="overflow-hidden text-ellipsis whitespace-nowrap 
                         mb-2 text-[15px] font-bold leading-tight text-secondary dark:text-gray-100 sm:text-[16px]"
          >
            {title}
          </h3>
        </Link>

        {/* Rating */}
        {rating !== null && (
          <div className="mb-4 flex items-center gap-1 text-[13px] leading-none text-yellow-500 sm:text-[14px]">
            <BsStarFill />
            <BsStarFill />
            <BsStarFill />
            <BsStarFill />
            {rating >= 4.5 ? <BsStarFill /> : <BsStarHalf />}
            <span className="ml-1 text-[10px] text-gray-600 dark:text-gray-300">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price */}
        {typeof price === "number" && (
          <p className="mb-4 text-[18px] font-bold leading-none text-blue-600">
            ${price}
          </p>
        )}

        {/* Buttons */}
        <div className="w-full">
          <Buttons product={product} fullWidth hideFavouriteOnMobile />
        </div>
      </div>
    </div>
  );
}

export default Product;
