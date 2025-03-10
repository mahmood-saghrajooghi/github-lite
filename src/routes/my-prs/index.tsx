import { createFileRoute, Navigate } from '@tanstack/react-router'
import { PullRequestsList } from '@/components/pull-request-list'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { Link } from '@/components/link'
import { AppHeader } from '@/components/app-header'

export const Route = createFileRoute('/my-prs/')({
  component: App,
})

export default function App() {
  // Check if token exists in localStorage
  const hasToken =
    typeof window !== 'undefined' && localStorage.getItem('token')

  // If no token, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem className="text-foreground">
              <Link to="/pulls">Pull Requests</Link>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </AppHeader>
      <div className="grid grid-cols-[auto] grid-rows-[1fr]">
        <PullRequestsList />
      </div>
    </>
  )
}
