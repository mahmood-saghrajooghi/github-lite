import { AppHeader } from '@/components/app-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Link } from '@/components/link'
import { RepoPullRequestsList } from '@/components/repo-pull-request-list'

export const Route = createFileRoute('/$owner/$repo/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { owner, repo } = useParams({ from: Route.id })

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem>{owner}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/$owner/$repo"
                  params={{ owner, repo }}
                >
                  {repo}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </AppHeader>

      <div className="grid grid-cols-[auto] grid-rows-[1fr]">
        <RepoPullRequestsList
          owner={owner}
          repo={repo}
          search={{
            state: 'open',
            perPage: 40,
          }}
        />
      </div>
    </>
  )
}
