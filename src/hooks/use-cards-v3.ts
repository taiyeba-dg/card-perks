import { useQuery } from "@tanstack/react-query";
import type { CardV3 } from "@/data/card-v3-unified-types";

async function fetchCardsV3(): Promise<CardV3[]> {
  const res = await fetch("/data/cards-v3.json");
  if (!res.ok) throw new Error(`Cards V3 fetch failed: ${res.status}`);
  return res.json();
}

export function useCardsV3() {
  const query = useQuery({
    queryKey: ["cards-v3"],
    queryFn: fetchCardsV3,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });

  const cards = query.data ?? [];

  return {
    cards,
    getCardById: (id: string) => cards.find((c) => c.id === id),
    getCardsByBank: (bankId: string) => cards.filter((c) => c.bankId === bankId),
    loading: query.isLoading,
    isLive: query.isSuccess,
    isError: query.isError,
    refetch: query.refetch,
  };
}
