"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getBrokerAccounts } from "@/lib/api";
import type { BrokerAccount } from "@/lib/types";

export function useBrokerConnected() {
  const query = useQuery({
    queryKey: ["broker", "accounts"],
    queryFn: async () => {
      const response = await getBrokerAccounts();
      return (response.data ?? []) as BrokerAccount[];
    },
    staleTime: 30_000,
  });

  return {
    ...query,
    accounts: query.data ?? [],
    hasBroker: (query.data?.length ?? 0) > 0,
  };
}

export function useRequireBroker() {
  const router = useRouter();
  const { hasBroker, isLoading } = useBrokerConnected();

  const requireBroker = (returnPath: string, onReady: () => void) => {
    if (isLoading) return;
    if (!hasBroker) {
      router.push(`/dashboard/broker?next=${encodeURIComponent(returnPath)}`);
      return;
    }
    onReady();
  };

  return { requireBroker, hasBroker, isLoading };
}
