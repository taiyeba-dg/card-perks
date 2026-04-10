import { useQuery } from "@tanstack/react-query";
import { fetchVouchers } from "@/lib/voucher-api";
import { vouchers as staticVouchers } from "@/data/vouchers";

export function useVouchers() {
  const query = useQuery({
    queryKey: ["vouchers"],
    queryFn: fetchVouchers,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    placeholderData: staticVouchers,
  });

  return {
    vouchers: query.data ?? staticVouchers,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
    isLive: query.isSuccess && !query.isPlaceholderData,
  };
}
