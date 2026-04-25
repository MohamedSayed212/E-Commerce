import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Product from "../Components/ProductSlider/Product";
function CategoryPage() {
  // Route param name must be the same as App route: /category/:categoryName
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  // Header link uses encodeURIComponent, so decode it here before fetch.
  const decodedCategoryName = decodeURIComponent(categoryName || "");

  useEffect(() => {
    // Guard: avoid fetching when param is missing.
    if (!decodedCategoryName) return;

    fetch(`https://dummyjson.com/products/category/${decodedCategoryName}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(() => {
        setProducts([]);
      });
  }, [decodedCategoryName]);

  return (
    <div className="pt-[30px] !h-[350px] sm:container px-3">
      <h1 className="mb-6 text-2xl font-bold capitalize text-gray-900 dark:text-white">
        {decodedCategoryName}
      </h1>

      {products.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No products found</p>
      ) : (
        <div className="grid gap-4 text-gray-900 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 dark:text-gray-100">
          {products.map((item) => (
            // Reuse existing product card component for same UI/behavior.
            <Product key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
