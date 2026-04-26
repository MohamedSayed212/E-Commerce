import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import Buttons from "./Buttons.jsx";
import Product from "./ProductSlider/Product.jsx";
import "swiper/css";
import defaultPicture from "../assets/defaultPicture.webp";
import RatingStars from "./RatingStars.jsx";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mainImage, setMainImage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`https://dummyjson.com/products/${id}`);
        const data = await res.json();
        setProduct(data);

        // 🔥 set first image
        if (data?.images?.length > 0) {
          setMainImage(data.images[0]);
        }

        const simRes = await fetch(
          `https://dummyjson.com/products/category/${data.category}`,
        );
        const simData = await simRes.json();
        setSimilar(simData.products || []);
      } catch {
        setError("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="mt-10 text-center text-gray-700 dark:text-gray-300">
        Loading product...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-10 text-center text-gray-800 dark:text-gray-200">
        <p>{error}</p>
        <Link to="/" className="text-primary underline hover:text-primaryHover">
          Go Back
        </Link>
      </div>
    );
  }

  if (!product) return null;

  // UI
  return (
    // container
    <div className="p-6 sm:container xs:mt-[-40px] sm:mt-[-30px]">
      {/* Top Section */}
      <div className="flex flex-col gap-7 rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900 dark:shadow-black/40 lg:flex-row">
        {/* 🔥 Images Section */}
        <div className="flex items-center xs:gap-5 sm:gap-[80px] justify-center rounded-xl bg-gray-100 p-6 xs:flex-col sm:flex-row-reverse dark:bg-gray-800/80">
          {/* Main Image */}
          <div>
            <img
              src={mainImage}
              alt={product.title}
              className=" xs:h-[200px] sm:h-[250px] md:h-[400px] justify-center   object-contain transition duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex sm:flex-col gap-4  md:mt-4">
            {product.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`product-${index}`}
                onClick={() => setMainImage(img)} // 🔥 change image
                className={`h-[60px] w-[60px] cursor-pointer rounded border-[2px] object-cover p-1 transition hover:scale-110 ${
                  mainImage === img
                    ? "scale-105 border-blue-800 dark:border-lightBlue"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 🔥 Info Section */}
        <div className="flex flex-1 flex-col xs:mt-[-5px]   md:mt-[20px]  gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {product.title}
          </h1>

          <span className="w-fit rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-100">
            {product.category}
          </span>

          <p className="text-[18px] leading-relaxed text-gray-600 dark:text-gray-300">
            {product.description}
          </p>

          <p className="text-4xl font-bold text-primary">${product.price}</p>

          {/* Brand + Rating */}
          <div className="flex flex-col gap-2 text-[18px] text-gray-500 dark:text-gray-400">
            <span>Brand: {product.brand}</span>
            <RatingStars rating={product.rating} />
            <span>Warranty: {product.warrantyInformation}</span>
          </div>

          {/* Buttons */}
          <div className="  xs:mt-[-10px]  mt-1 w-[300px]">
            {/* Pass the current product so Add to Cart can use context */}
            <Buttons product={product} />
          </div>
        </div>
      </div>

      {/* 🔥 Similar Products */}
      <div className=" xs:mt-[40px]  md:mt-[50px]">
        <h2 className="mb-4 text-2xl font-bold text-secondary dark:text-gray-200">
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
          {similar
            .filter((item) => item.id !== product.id)
            .map((item) => (
              <SwiperSlide key={item.id}>
                <Product product={item} />
              </SwiperSlide>
            ))}
        </Swiper>
      </div>

      {/* 🔥 Reviews */}
      <div className="mt-[50px]">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Reviews
        </h2>

        {product.reviews?.map((review, index) => (
          <div
            key={index}
            className="mb-6 border-t border-gray-200 pt-4 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <img
                src={defaultPicture}
                alt="default"
                className="w-[45px] h-[45px] rounded-full"
              />

              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {review.reviewerName}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400">
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

            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductDetails;
