import React from "react";
import { BsStarFill, BsStarHalf } from "react-icons/bs";
import { Link } from "react-router-dom";
import Buttons from "../Buttons";

function Product({ product }) {
  if (!product) return null;

  const title = product.title ?? "Product";
  const price = product.price;
  const rating = typeof product.rating === "number" ? product.rating : null;
  const image = product.thumbnail ?? product.images?.[0];

  return (
    <div
      className="w-full  max-w-[240px] mx-auto rounded-lg h-[340px] sm:h-[370px] bg-gray-200 shadow-sm hover:shadow-md transition duration-300 
                    p-2 sm:p-3 flex flex-col"
    >
      {/* 🔹 Image */}
      <div
        className="w-full  xs:h-[17s0px] sm:h-[180px] md:h-[200px] 
                      flex items-center justify-center mb-2 rounded-md overflow-hidden"
      >
        <Link
          to={`/products/${product.id}`}
          className="w-full h-full flex items-center justify-center"
        >
          {image && (
            <img
              src={image}
              alt={title}
              className="max-w-full max-h-full object-contain transition duration-200 hover:scale-105"
              loading="lazy"
              draggable={false}
            />
          )}
        </Link>
      </div>

      {/* 🔹 Info */}
      <div className="text-left flex flex-col flex-1">
        {/* Title */}
        <Link to={`/products/${product.id}`}>
          <h3
            className="overflow-hidden text-ellipsis whitespace-nowrap 
                         text-[17px]  sm:text-[15px] font-bold text-secondary mb-1"
          >
            {title}
          </h3>
        </Link>

        {/* Rating */}
        {rating !== null && (
          <div className="flex items-center gap-1 mb-1 text-yellow-500 text-[15px] xs:text-md">
            <BsStarFill />
            <BsStarFill />
            <BsStarFill />
            <BsStarFill />
            {rating >= 4.5 ? <BsStarFill /> : <BsStarHalf />}
            <span className="text-[10px] text-gray-600 ml-1">
              {rating.toFixed(1)}
            </span>
          </div>
        )}

        {/* Price */}
        {typeof price === "number" && (
          <p className="text-blue-600 font-bold text-[18px]  mb-1">${price}</p>
        )}

        {/* Buttons */}
        <div className=" w-full">
          <Buttons product={product} />
        </div>
      </div>
    </div>
  );
}

export default Product;
