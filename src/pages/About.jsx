import React from "react";
import { Link } from "react-router-dom";
import { FaShippingFast, FaShieldAlt, FaHeadset } from "react-icons/fa";

const highlights = [
  {
    title: "Fast Delivery",
    description:
      "We dispatch orders quickly and keep you updated from checkout to doorstep.",
    icon: FaShippingFast,
  },
  {
    title: "Secure Shopping",
    description:
      "Your payments and account data are protected with trusted security practices.",
    icon: FaShieldAlt,
  },
  {
    title: "Helpful Support",
    description:
      "Our team is ready to help with product questions, tracking, and returns.",
    icon: FaHeadset,
  },
];

function About() {
  // Dark mode: the header toggle adds class "dark" on <html>.
  // Any class here that starts with "dark:" only shows when dark mode is ON.
  return (
    <main className="sm:container h-[800px] px-6 pb-14">
      {/* Page heading section */}
      <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900 dark:shadow-black/30 md:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          About Us
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
          Built to make shopping simple and reliable
        </h1>
        <p className="mt-4 max-w-3xl text-base text-gray-600 dark:text-gray-300 md:text-lg">
          E-Commerce is focused on a clean, fast, and trustworthy buying
          experience. We curate products people use every day and keep the
          journey smooth from browsing to checkout.
        </p>
      </section>

      {/* Value cards */}
      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md dark:bg-gray-900 dark:shadow-black/30 dark:hover:shadow-lg"
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="text-xl" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            </article>
          );
        })}
      </section>

      {/* Mission + CTA */}
      <section className="mt-8 rounded-2xl bg-gray-100 p-6 dark:bg-gray-800/80 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Our Mission
        </h2>
        <p className="mt-3 max-w-3xl text-gray-700 dark:text-gray-200">
          We aim to combine great product quality, fair pricing, and smooth user
          experience. Every update in this store is designed to save time and
          make decisions easier for customers.
        </p>
        <div className="mt-6">
          {/* Quick action that matches primary button style in the app */}
          <Link
            to="/home"
            className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primaryHover"
          >
            Start Shopping
          </Link>
        </div>
      </section>
    </main>
  );
}

export default About;
