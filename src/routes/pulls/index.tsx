import { AppHeader } from '@/components/app-header'
import { PullRequestsList } from '@/components/pull-request-list'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { Link } from '@/components/link'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pulls/')({
  component: RouteComponent,
})

function RouteComponent() {
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
