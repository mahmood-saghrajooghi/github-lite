import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { PullRequestsList } from '@/components/my-pull-request-list'
import { Link } from '@/components/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { AppHeader } from '@/components/app-header'

export const Route = createLazyFileRoute('/')({
  component: App,
})

export default function App() {
  // Check if token exists in localStorage
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');

  // If no token, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">
                  Pull Requests
                </Link>
              </BreadcrumbLink>
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
