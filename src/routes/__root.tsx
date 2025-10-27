import { createRootRoute, Outlet } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Layout } from '@/components/layout'
import { DiffModeProvider } from '@/contexts/diff-mode-context'

export const Route = createRootRoute({
  component: () => (
    <>
      <DiffModeProvider>
        <Layout>
          <Outlet />
        </Layout>
      </DiffModeProvider>
      {/* <TanStackRouterDevtools /> */}
    </>
  ),
})
