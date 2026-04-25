import React, { useContext } from "react";
import { FavouriteContext } from "../Components/Context/FavouriteContext";
import Product from "../Components/ProductSlider/Product";
function FavouritePage() {
  const { favourites } = useContext(FavouriteContext);

  return (
    <div className="p-2 sm:container">
      {favourites.length === 0 ? (
        <p className="text-[30px] font-semibold text-gray-800 dark:text-gray-200">
          No Favourites yet
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
          {favourites.map((product) => (
            <Product key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default FavouritePage;
