import React from "react";
import Product from "./Product";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

function ProductSlider({ catName, products = [] }) {
  return (
    // container
    <div className="w-full xs:mt-[25px] sm:mt-[50px] ">
      <div className="w-full sm:container  ">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-lg  font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">
            {catName}
          </h2>
        </div>

        {/* Slider */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={5}
          allowTouchMove={true}
          breakpoints={{
            0: { slidesPerView: 2 },
            576: { slidesPerView: 3 },
            768: { slidesPerView: 3 },
            992: { slidesPerView: 4 },
            1200: { slidesPerView: 5 },
            1400: { slidesPerView: 6 },
          }}
        >
          {products.map((product) => (
            <SwiperSlide className="" key={product.id}>
              <Product product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default ProductSlider;
