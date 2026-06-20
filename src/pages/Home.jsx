import React, { useEffect, useState } from "react";
import HeroSlider from "../Components/HeroSlider";
import ProductSlider from "../Components/ProductSlider/ProductSlider";
import { supabase } from "../lib/supabase";

// Display order for category sliders — matches the seed script category list.
// Categories not in this list are appended alphabetically at the end.
const CATEGORY_ORDER = [
  "Smartphones",
  "Laptops",
  "Tablets",
  "Gaming",
  "Headphones",
  "Smart Watches",
  "Cameras",
  "Furniture",
  "Home Decor",
  "Men's Fashion",
  "Women's Fashion",
  "Shoes",
  "Beauty",
  "Sports",
  "Accessories",
];

function Home() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Single query — fetch all active products with their category name.
      // PostgREST returns categories as a nested object because of the FK.
      const { data: products, error } = await supabase
        .from("products")
        .select("*, categories(id, name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[Home] fetch error:", error);
        setLoading(false);
        return;
      }

      // Group products by their category name
      const grouped = {};
      for (const product of products || []) {
        const catName = product.categories?.name || "Other";
        if (!grouped[catName]) grouped[catName] = [];

        // Normalize shape so Product.jsx card gets title and thumbnail
        grouped[catName].push({
          ...product,
          title: product.name,
          thumbnail: product.images?.[0] ?? null,
        });
      }

      // Sort sections so they appear in the order defined in CATEGORY_ORDER.
      // Categories not in the list are pushed to the end alphabetically.
      const sectionList = Object.entries(grouped)
        .map(([categoryName, prods]) => ({ categoryName, products: prods }))
        .sort((a, b) => {
          const ia = CATEGORY_ORDER.indexOf(a.categoryName);
          const ib = CATEGORY_ORDER.indexOf(b.categoryName);
          if (ia === -1 && ib === -1)
            return a.categoryName.localeCompare(b.categoryName);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

      setSections(sectionList);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div>
        <HeroSlider />
        <div className="flex justify-center py-24">
          <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroSlider />

      {sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-xl font-semibold text-gray-700">No products yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Run <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">npm run seed</code> to populate the store.
          </p>
        </div>
      ) : (
        sections.map((section) => (
          <ProductSlider
            key={section.categoryName}
            catName={section.categoryName}
            products={section.products}
          />
        ))
      )}
    </div>
  );
}

export default Home;
