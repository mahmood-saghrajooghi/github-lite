import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: false,
      // 1 minute
      staleTime: 1000 * 60,
      // 1 hour
      gcTime: 1000 * 60 * 60,
    },
  },
})

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})
