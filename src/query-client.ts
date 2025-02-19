
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
      // 1 hour
      staleTime: 1000 * 60 * 60,
      gcTime: 1000 * 60 * 60,
    },
  },
})
