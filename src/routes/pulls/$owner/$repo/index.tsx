import { AppHeader } from '@/components/app-header'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbLink } from '@/components/ui/breadcrumb'
import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { PullRequestsSidebar } from '@/components/pull-request-sidebar'
import { z } from 'zod'
import { Link } from '@/components/link'

const searchSchema = z.object({
  author: z.string().optional(),
})

export const Route = createFileRoute('/pulls/$owner/$repo/')({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
})

function RouteComponent() {
  const { owner, repo } = useParams({ from: Route.id })

  const searchParams = useSearch({ from: Route.id })
  const navigate = Route.useNavigate()

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={'/pulls'} hotKey="g p">Pull requests</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{owner}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={'/pulls/$owner/$repo'} params={{ owner, repo }}>
                  {repo}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </AppHeader>
      <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr]">
        <PullRequestsSidebar
          owner={owner}
          repo={repo}
          searchParams={searchParams}
          navigate={navigate}
        />
      </div>
    </>
  )
}
