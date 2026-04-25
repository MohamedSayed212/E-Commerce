import React, { useState, useEffect, createContext } from "react";

export const FavouriteContext = createContext();

export function FavouriteProvider({ children }) {
  // 🧠 Load from localStorage first
  const [favourites, setFavourites] = useState(() => {
    const saved = localStorage.getItem("favourites");
    return saved ? JSON.parse(saved) : [];
  });

  // 💾 Save to localStorage whenever favourites change
  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  // ➕ Add to favourites
  const addToFavourites = (product) => {
    setFavourites((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  // ❌ Remove from favourites
  const removeFromFavourites = (id) => {
    setFavourites((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <FavouriteContext.Provider
      value={{
        favourites,
        addToFavourites,
        removeFromFavourites,
        favouritesCount: favourites.length,
      }}
    >
      {children}
    </FavouriteContext.Provider>
  );
}

export default FavouriteProvider;
