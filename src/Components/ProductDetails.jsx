import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import Buttons from "./Buttons.jsx";
import Product from "./ProductSlider/Product.jsx";
import "swiper/css";
import defaultPicture from "../assets/defaultPicture.webp";
import RatingStars from "./RatingStars.jsx";
import { supabase } from "../lib/supabase.js";
import PriceDisplay from "./PriceDisplay.jsx";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function ProductDetails() {
  const { id } = useParams();
  const isSupabaseProduct = UUID_REGEX.test(id);

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(null);
    setProduct(null);
    setSimilar([]);
    setMainImage("");

    if (isSupabaseProduct) {
      (async () => {
        try {
          const { data, error: err } = await supabase
            .from("products")
            .select("*, categories(id, name)")
            .eq("id", id)
            .single();

          if (err || !data) {
            setError("Product not found.");
            return;
          }

          const normalized = {
            ...data,
            title: data.name,
            thumbnail: data.images?.[0] ?? null,
          };
          setProduct(normalized);
          if (data.images?.length > 0) setMainImage(data.images[0]);

          if (data.category_id) {
            const { data: simData } = await supabase
              .from("products")
              .select("*")
              .eq("category_id", data.category_id)
              .eq("is_active", true)
              .neq("id", id)
              .limit(10);

            setSimilar(
              (simData || []).map((p) => ({
                ...p,
                title: p.name,
                thumbnail: p.images?.[0] ?? null,
              }))
            );
          }
        } catch {
          setError("Something went wrong.");
        } finally {
          setLoading(false);
        }
      })();
    } else {
      (async () => {
        try {
          const res = await fetch(`https://dummyjson.com/products/${id}`);
          const data = await res.json();
          setProduct(data);
          if (data?.images?.length > 0) setMainImage(data.images[0]);

          const simRes = await fetch(
            `https://dummyjson.com/products/category/${data.category}`
          );
          const simData = await simRes.json();
          setSimilar(simData.products || []);
        } catch {
          setError("Something went wrong.");
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, isSupabaseProduct]);

  if (loading) {
    return (
      <div className="mt-10 text-center text-gray-700">Loading product...</div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-center text-gray-800">
        <p>{error}</p>
        <Link to="/" className="text-primary underline hover:text-primaryHover">
          Go Back
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const title = product.title ?? product.name ?? "Product";
  const images = product.images ?? [];

  return (
    <div className="p-6 sm:container xs:mt-[-40px] sm:mt-[-30px]">
      {/* Top Section */}
      <div className="flex flex-col gap-7 rounded-2xl bg-white p-6 shadow-lg lg:flex-row">
        {/* Images Section */}
        <div className="flex items-center xs:gap-5 sm:gap-[80px] justify-center rounded-xl bg-gray-100 p-6 xs:flex-col sm:flex-row-reverse">
          {/* Main Image */}
          <div>
            {mainImage ? (
              <img
                src={mainImage}
                alt={title}
                className="xs:h-[200px] sm:h-[250px] md:h-[400px] object-contain transition duration-300 hover:scale-105"
                onError={(e) => {
                  console.warn("[ProductDetails] main image failed to load:", mainImage);
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="xs:h-[200px] sm:h-[250px] md:h-[400px] w-full flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex sm:flex-col gap-4 md:mt-4">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`product-${index}`}
                  onClick={() => setMainImage(img)}
                  className={`h-[60px] w-[60px] cursor-pointer rounded border-[2px] object-cover p-1 transition hover:scale-110 ${
                    mainImage === img
                      ? "scale-105 border-blue-800"
                      : "border-gray-300"
                  }`}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-1 flex-col xs:mt-[-5px] md:mt-[20px] gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>

          {(product.category || product.categories?.name) && (
            <span className="w-fit rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800">
              {product.categories?.name ?? product.category}
            </span>
          )}

          <p className="text-[18px] leading-relaxed text-gray-600">
            {product.description}
          </p>

          <PriceDisplay price={product.price} comparePrice={product.compare_price} size="lg" />

          {/* Brand + Rating (dummyjson products only) */}
          {(product.brand || product.rating) && (
            <div className="flex flex-col gap-2 text-[18px] text-gray-500">
              {product.brand && <span>Brand: {product.brand}</span>}
              {product.rating && <RatingStars rating={product.rating} />}
              {product.warrantyInformation && (
                <span>Warranty: {product.warrantyInformation}</span>
              )}
            </div>
          )}

          <div className="xs:mt-[-10px] mt-1 w-[300px]">
            <Buttons product={product} />
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <div className="xs:mt-[40px] md:mt-[50px]">
          <h2 className="mb-4 text-2xl font-bold text-secondary">
            Similar Products
          </h2>
          <Swiper
            className="product-details-similar !pb-2"
            spaceBetween={12}
            breakpoints={{
              0: { slidesPerView: 2 },
              420: { slidesPerView: 2 },
              576: { slidesPerView: 2.5 },
              768: { slidesPerView: 3 },
              992: { slidesPerView: 4 },
              1200: { slidesPerView: 5 },
              1400: { slidesPerView: 5 },
            }}
          >
            {similar.map((item) => (
              <SwiperSlide key={item.id}>
                <Product product={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Reviews (dummyjson products only) */}
      {product.reviews?.length > 0 && (
        <div className="mt-[50px]">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Reviews</h2>
          {product.reviews.map((review, index) => (
            <div
              key={index}
              className="mb-6 border-t border-gray-200 pt-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={defaultPicture}
                  alt="default"
                  className="w-[45px] h-[45px] rounded-full"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {review.reviewerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <RatingStars rating={review.rating} />
              </div>
              <p className="mt-2 text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
