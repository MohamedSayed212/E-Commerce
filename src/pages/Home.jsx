import React, { useEffect, useState } from "react";
import HeroSlider from "../Components/HeroSlider";
import ProductSlider from "../Components/ProductSlider/ProductSlider";

const categories = [
  "smartphones",
  "laptops",
  "beauty",
  "fragrances",
  "mens-shirts",
  "mens-shoes",
  "skin-care",
  "mens-watches",
  "tablets",
  "sports-accessories",
  "mobile-accessories",
];

function Home() {
  const [productsByCategory, setProductsByCategory] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch each category in parallel, then merge into one object:
        // { smartphones: [...], laptops: [...], ... } so the UI can render sliders by key.
        const results = await Promise.all(
          categories.map(async (category) => {
            const res = await fetch(
              `https://dummyjson.com/products/category/${category}`,
            );
            const data = await res.json();
            return { [category]: data.products };
          }),
        );

        const combined = results.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {},
        );
        setProductsByCategory(combined);

        // ✅ Log the fetched data here
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* slider under header */}
      <HeroSlider />

      {/* showing a few categories */}
      {productsByCategory["smartphones"] && (
        <ProductSlider
          catName="Mobile Phones"
          products={productsByCategory["smartphones"]}
        />
      )}
      {productsByCategory["laptops"] && (
        <ProductSlider
          catName="Laptops"
          products={productsByCategory["laptops"]}
        />
      )}
      {productsByCategory["mobile-accessories"] && (
        <ProductSlider
          catName="mobile-accessories"
          products={productsByCategory["mobile-accessories"]}
        />
      )}
      {productsByCategory["beauty"] && (
        <ProductSlider
          catName="Beauty"
          products={productsByCategory["beauty"]}
        />
      )}
      {productsByCategory["fragrances"] && (
        <ProductSlider
          catName="fragrances"
          products={productsByCategory["fragrances"]}
        />
      )}
      {/* Add more categories as needed */}
    </div>
  );
}

export default Home;
