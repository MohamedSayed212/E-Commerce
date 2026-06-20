import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Product from "../Components/ProductSlider/Product";

function CategoryPage() {
  const { categoryName } = useParams(); // holds the Supabase category UUID

  const [categoryLabel, setCategoryLabel] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryName) return;

    async function fetchData() {
      setLoading(true);

      // Fetch the category name for the page title
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryName)
        .single();

      setCategoryLabel(cat?.name || "");

      // Fetch all active products belonging to this category
      const { data: prods } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryName)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      console.log("[CategoryPage] raw products from Supabase:", prods);
      prods?.forEach((p) => {
        console.log(`  product "${p.name}" → images:`, p.images);
      });

      // Normalize Supabase shape → shape that Product.jsx card expects
      // (Product.jsx reads product.title and product.thumbnail)
      setProducts(
        (prods || []).map((p) => ({
          ...p,
          title: p.name,
          thumbnail: p.images?.[0] ?? null,
        }))
      );

      setLoading(false);
    }

    fetchData();
  }, [categoryName]);

  return (
    <div className="pt-[30px] sm:container px-3 min-h-[400px]">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {categoryLabel}
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-gray-700">No products found</p>
          <p className="text-sm text-gray-400 mt-1">
            Products in this category will appear here once added from the dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {products.map((item) => (
            <Product key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
