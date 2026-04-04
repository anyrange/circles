import type { UseInfiniteQueryResult } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export const useInfinityQuery = (activeQuery: UseInfiniteQueryResult) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !activeQuery.hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting && !activeQuery.isFetchingNextPage) {
        void activeQuery.fetchNextPage();
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [activeQuery]);

  return loadMoreRef;
};
