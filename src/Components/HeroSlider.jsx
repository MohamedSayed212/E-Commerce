import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import techBanner from "../assets/techBanner.jpeg";
import fragBanner from "../assets/fragBanner.jpg";
import beautyBanner from "../assets/beautyBanner.jpg";
import menFashion from "../assets/menFashion.jpg";

const slides = [
  {
    image: techBanner,
    label: "Tech & gear",
    title: "Devices for how you live",
    subtitle: "Smart accessories and electronics for work and play.",
    cta: "Browse tech",
    categorySlug: "smartphones",
  },
  {
    image: fragBanner,
    label: "Fragrance",
    title: "Scents that stay with you",
    subtitle: "Signature bottles and everyday favorites.",
    cta: "Discover scents",
    categorySlug: "fragrances",
  },
  {
    image: beautyBanner,
    label: "Beauty & care",
    title: "Glow up your routine",
    subtitle: "Skincare and self-care picks for real results.",
    cta: "Shop beauty",
    categorySlug: "beauty",
  },
  {
    image: menFashion,
    label: "Men’s fashion",
    title: "Fresh fits for the season",
    subtitle: "Clean lines and staples you’ll wear on repeat.",
    cta: "View collection",
    categorySlug: "mens-shirts",
  },
];

function HeroSlider() {
  return (
    <section className="  xs:mt-[-40px] sm:container sm:mt-[-30px] md:mt-[-10px] lg:mt-[-15px]">
      {/* container */}
      <div className="   sm:mx-auto xs:px-2 px-6">
        <Swiper
          className="hero-swiper overflow-hidden rounded-xl"
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop
          slidesPerView={1}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.title}>
              {/* Image */}
              <div
                className="relative flex w-full items-center overflow-hidden bg-gray-900 
                    xs:h-[220px] sm:h-[260px] md:h-[360px] lg:h-[440px]"
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  loading={index === 0 ? "eager" : "lazy"}
                  draggable={false}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />

                {/* Content */}
                <div className="relative z-10 w-full h-full flex px-2 items-center">
                  <div className="w-full max-w-xl px-3 sm:px-6 md:px-10 text-left">
                    <p className="mb-1 text-xs sm:text-sm font-semibold uppercase tracking-wider text-lightBlue">
                      {slide.label}
                    </p>

                    <h2 className="mb-2 text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                      {slide.title}
                    </h2>

                    <p className="mb-3 text-sm sm:text-base md:text-lg text-gray-200">
                      {slide.subtitle}
                    </p>

                    <Link
                      to={`/category/${encodeURIComponent(slide.categorySlug)}`}
                      className="inline-flex items-center rounded-md bg-primary px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base font-semibold text-white transition hover:bg-primaryHover"
                    >
                      {slide.cta}
                    </Link>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default HeroSlider;
