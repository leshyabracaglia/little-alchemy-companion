import { useMemo, useState } from "react";
import { ELEMENTS, ELEMENTS_BY_TIER, Element } from "../constants/elements";

export function useElementSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredElements = useMemo(() => {
    if (!searchQuery.trim()) {
      return null; // Return null to indicate "show grouped by tier"
    }

    const query = searchQuery.toLowerCase().trim();
    return ELEMENTS.filter((element) =>
      element.name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const groupedElements = useMemo(() => {
    if (filteredElements) {
      // When searching, group results by tier
      const grouped: Record<number, Element[]> = {};
      filteredElements.forEach((element) => {
        if (!grouped[element.tier]) grouped[element.tier] = [];
        grouped[element.tier].push(element);
      });
      return grouped;
    }
    return ELEMENTS_BY_TIER;
  }, [filteredElements]);

  const sortedTiers = useMemo(() => {
    return Object.keys(groupedElements)
      .map(Number)
      .sort((tierA, tierB) => {
        // Special tier (-1) comes after tier 0
        if (tierA === -1) return 1;
        if (tierB === -1) return -1;
        return tierA - tierB;
      });
  }, [groupedElements]);

  return {
    searchQuery,
    setSearchQuery,
    groupedElements,
    sortedTiers,
    resultCount: filteredElements?.length ?? ELEMENTS.length,
    isSearching: searchQuery.trim().length > 0,
  };
}
