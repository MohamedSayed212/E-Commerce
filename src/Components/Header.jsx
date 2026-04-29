import React, { useContext, useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { FaSearch, FaHeart, FaShoppingCart } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { HiArrowSmDown } from "react-icons/hi";
import { PiSignInBold } from "react-icons/pi";
import { FaUserPlus } from "react-icons/fa6";
import { CartContext } from "./Context/CartContext";
import { FavouriteContext } from "./Context/FavouriteContext";

function SearchResultsDropdown({ loading, results, onPick }) {
  return (
    <div
      className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[min(70vh,22rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white py-2 shadow-lg  "
      role="listbox"
      aria-label="Search results"
    >
      {loading && (
        <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Searching…
        </p>
      )}
      {!loading && results.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          No products found.
        </p>
      )}
      {!loading &&
        results.map((item) => (
          <Link
            key={item.id}
            to={`/products/${item.id}`}
            role="option"
            onClick={onPick}
            className="flex min-h-[3rem] items-center gap-3 px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60"
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="h-11 w-11 shrink-0 rounded-md object-cover"
              loading="lazy"
            />
            <span className="min-w-0 flex-1 text-left text-sm font-medium text-gray-800 line-clamp-2 dark:text-gray-100">
              {item.title}
            </span>
            {item.price != null && (
              <span className="shrink-0 text-sm font-semibold text-primary">
                ${Number(item.price).toFixed(2)}
              </span>
            )}
          </Link>
        ))}
    </div>
  );
}

function Header() {
  // Dark / light toggle (see ThemeContext.jsx)

  // Get cart badge number and sidebar opener from context.
  const { cartCount, setIsCartOpen } = useContext(CartContext);

  const [categories, setCategories] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showBottomHeader, setShowBottomHeader] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { favouritesCount } = useContext(FavouriteContext);
  const NavLinks = [
    { title: "Home", link: "/" },

    { title: "About", link: "/about" },

    { title: "Contact", link: "/contact" },
  ];

  useEffect(() => {
    fetch("https://dummyjson.com/products/categories")
      .then((res) => res.json())
      .then((data) =>
        // API returns strings, wrap them into objects
        setCategories(data),
      );
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBottomHeader(window.scrollY <= 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleQueryChange = (value) => {
    setQuery(value);
    if (value.trim() === "") {
      setResults([]);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const q = query.trim();
    if (q === "") return;

    let stale = false;
    const controller = new AbortController();
    const delay = setTimeout(() => {
      if (stale) return;
      setSearchLoading(true);
      fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(q)}`,
        { signal: controller.signal },
      )
        .then((res) => res.json())
        .then((data) => {
          if (stale) return;
          setResults(Array.isArray(data.products) ? data.products : []);
        })
        .catch((err) => {
          if (err.name === "AbortError" || stale) return;
          setResults([]);
        })
        .finally(() => {
          if (!stale) setSearchLoading(false);
        });
    }, 400);

    return () => {
      stale = true;
      clearTimeout(delay);
      controller.abort();
    };
  }, [query]);

  const showSearchPanel = query.trim().length > 0;

  const getCategorySlug = (cat) =>
    typeof cat === "string" ? cat : cat?.slug || "";
  const getCategoryLabel = (cat) =>
    typeof cat === "string" ? cat : cat?.name || cat?.slug || "";

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-transparent bg-white ">
      {/* all contnet div */}
      <div className="md:mx-auto ">
        {" "}
        {/* top header div */}
        <div className="sm:container">
          <div className="   px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Menu Button (Mobile) */}
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="md:hidden text-3xl text-gray-800 dark:text-gray-100"
              >
                <IoMenu />
              </button>

              {/* Logo */}
              <Link to="/home">
                <img
                  src={logo}
                  alt="logo"
                  className="  xs:h-[50px] md:h-[60px]"
                />
              </Link>
            </div>
            {/* SEARCH (Desktop Centered) */}
            <form
              className="relative mx-4 hidden max-w-[700px] flex-1 md:flex md:flex-col"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="relative w-full">
                <input
                  type="search"
                  placeholder="Search for Products"
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-expanded={showSearchPanel}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-cosmic-sky dark:focus:ring-2 dark:focus:ring-cosmic-violet/35"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Search"
                >
                  <FaSearch />
                </button>
                {showSearchPanel && (
                  <SearchResultsDropdown
                    loading={searchLoading}
                    results={results}
                    onPick={() => handleQueryChange("")}
                  />
                )}
              </div>
            </form>

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 hover:bg-gray-100">
                  <Link to="/favourite">
                    <FaHeart className=" xs:text-xl md:text-2xl text-gray-800 dark:text-gray-100" />
                  </Link>
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {favouritesCount}
                  </span>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="inline-flex cursor-pointer items-center justify-center rounded-md p-2 hover:bg-gray-100"
                >
                  <FaShoppingCart className="text-2xl text-gray-800 dark:text-gray-100" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                    {cartCount}
                  </span>
                </button>
              </div>
            </div>
          </div>
          {/* MOBILE SEARCH */}
          <form
            className="relative px-6 pb-3 sm:mx-[20px] md:hidden"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative w-full">
              <input
                type="search"
                placeholder="Search for Products"
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showSearchPanel}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-11 text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary "
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Search"
              >
                <FaSearch />
              </button>
              {showSearchPanel && (
                <SearchResultsDropdown
                  loading={searchLoading}
                  results={results}
                  onPick={() => handleQueryChange("")}
                />
              )}
            </div>
          </form>
          {/* MOBILE SIDEBAR */}
          {menuOpen && (
            <div
              className="md:hidden  fixed inset-0 z-50 bg-black/1"
              onClick={() => setMenuOpen(false)}
            >
              <div
                className="fixed top-[60px]  left-0 flex h-[calc(100vh)] w-[300px] flex-col overflow-y-auto bg-white p-4 shadow-lg dark:bg-gray-900 dark:text-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                {NavLinks.map((item, index) => (
                  <Link
                    key={`${item.title}-${index}`}
                    to={item.link}
                    className="rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}

                {/* Mobile categories */}
                <div className="mt-4">
                  <button
                    onClick={() => setMobileCatOpen((prev) => !prev)}
                    className="flex w-full items-center justify-between border-t border-gray-200 py-2 dark:border-gray-700"
                  >
                    <span className="font-semibold">Categories</span>
                    <HiArrowSmDown
                      className={`text-xl transition ${
                        mobileCatOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {mobileCatOpen && (
                    <div className="mt-2 pl-2 flex flex-col gap-1">
                      {categories.map((cat, index) => (
                        <Link
                          key={`${getCategorySlug(cat)}-${index}`}
                          // Must match App route: /category/:categoryName
                          to={`/category/${encodeURIComponent(getCategorySlug(cat))}`}
                          className="block rounded-md px-[5px] py-2 text-gray-600 duration-75 hover:bg-gray-100 hover:text-blue-400 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-lightBlue"
                          onClick={() => setMenuOpen(false)}
                        >
                          {getCategoryLabel(cat)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Auth Links */}
                <div className="mt-[15px] flex gap-4">
                  <Link
                    to="/signin"
                    className="flex-1 py-2 px-3 rounded-lg bg-primary hover:bg-primaryHover duration-200 text-white text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-center text-gray-700 duration-200 hover:bg-gray-400 hover:text-white dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* DESKTOP BOTTOM HEADER */}
        {showBottomHeader && (
          <div className="hidden !w-full border-t border-gray-300/80 bg-gray-300/65 text-gray-700 backdrop-blur-sm dark:border-gray-700 dark:bg-gradient-to-r dark:from-night-900/95 dark:via-violet-950/50 dark:to-night-900/95 dark:text-gray-200 md:block">
            {/* container */}
            <div className=" container px-[50px]">
              <div className="grid h-[60px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
                {/* Browse Categories */}
                <div className="relative flex items-center gap-2">
                  <span className="text-[17px] font-medium text-gray-800 dark:text-gray-100">
                    Browse category
                  </span>
                  <button
                    onClick={() => setCategoryOpen((prev) => !prev)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg duration-200 hover:bg-secondaryHover dark:hover:bg-gray-700"
                  >
                    <HiArrowSmDown
                      className={`text-2xl text-gray-600 transition ${
                        categoryOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {categoryOpen && (
                    <div className="absolute left-0 top-[45px] z-20 h-[500px] w-64 overflow-auto rounded-lg bg-white py-2 shadow-lg dark:bg-gray-900 dark:shadow-black/50">
                      {categories.map((cat, index) => (
                        <Link
                          key={`${getCategorySlug(cat)}-${index}`}
                          // Must match App route: /category/:categoryName
                          to={`/category/${encodeURIComponent(getCategorySlug(cat))}`}
                          className="block px-4 py-2 duration-75 hover:bg-gray-100 hover:text-lightBlue dark:text-gray-200 dark:hover:bg-gray-800"
                          onClick={() => setCategoryOpen(false)}
                        >
                          {getCategoryLabel(cat)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* meduim Nav Links */}
                <nav className="flex justify-center gap-2">
                  {NavLinks.map((item, index) => (
                    <Link
                      key={`${item.title}-${index}`}
                      to={item.link}
                      className="rounded-lg px-4 py-2 text-gray-600 duration-200 hover:bg-secondaryHover dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>

                {/* Right Icons */}
                <div className="   flex gap-5  ">
                  <Link to="/signin">
                    <div className="rounded-md px-2 py-2 text-gray-600 duration-200 hover:bg-secondaryHover dark:text-gray-300 dark:hover:bg-gray-700">
                      <PiSignInBold className="text-[25px]  " />
                    </div>
                  </Link>
                  <Link to="/signup">
                    <div className="rounded-md px-2 py-2 text-gray-600 duration-200 hover:bg-secondaryHover dark:text-gray-300 dark:hover:bg-gray-700">
                      <FaUserPlus className="text-[25px] " />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
