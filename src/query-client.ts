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
      // 1 hour
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      cacheTime: 1000 * 30, // 24 hours
    },
  },
})

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
})
