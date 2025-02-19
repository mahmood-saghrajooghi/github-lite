import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'

import { routeTree } from './routeTree.gen'

import './main.css'
import { HotkeyProvider } from './contexts/hotkey-context'
import { queryClient } from './query-client'

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HotkeyProvider>
        <RouterProvider router={router} />
      </HotkeyProvider>
    </QueryClientProvider>
  </StrictMode>,
)
