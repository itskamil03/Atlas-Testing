"use client";
import { useQuery } from '@tanstack/react-query';
import { getBrokerAccounts } from '@/lib/api';
import type { BrokerAccount } from '@/lib/types';

export function useBrokerAccountsQuery() {
  return useQuery<BrokerAccount[]>({
    queryKey: ['broker', 'accounts'],
    queryFn: async () => {
      const res = await getBrokerAccounts();
      return res.data || [];
    },
  });
}

export default useBrokerAccountsQuery;
