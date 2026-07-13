"use client";

import * as React from "react";
import { FAVOURITES_KEY, parseFavourites, serializeFavourites } from "./board";

export function useFavourites() {
  const [favourites, setFavourites] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    setFavourites(parseFavourites(localStorage.getItem(FAVOURITES_KEY)));
  }, []);

  const toggle = React.useCallback((id: number) => {
    setFavourites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(FAVOURITES_KEY, serializeFavourites(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const isFavourite = React.useCallback((id: number) => favourites.has(id), [favourites]);
  return { favourites, isFavourite, toggle };
}
