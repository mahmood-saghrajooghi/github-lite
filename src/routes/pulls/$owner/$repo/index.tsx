import { AppHeader } from '@/components/app-header'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbLink } from '@/components/ui/breadcrumb'
import { createFileRoute, Link, useNavigate, useParams, useSearch } from '@tanstack/react-router'
import { PullRequestsSidebar } from '@/components/pull-request-sidebar'
import { github } from '@/lib/client'
import useSWR from 'swr'
import { z } from 'zod'

const searchSchema = z.object({
  author: z.string().optional(),
})

export const Route = createFileRoute('/pulls/$owner/$repo/')({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
})

async function fetchRepoPullRequests(owner: string, repo: string) {
  try {
    const res = await github.search.issuesAndPullRequests({
      q: `is:pr is:open author:@me repo:${owner}/${repo}`,
      per_page: 10,
      sort: 'updated',
      order: 'desc',
    })

    const { data } = res
    return data
  } catch (err) {
    console.log(err)
  }
}

function RouteComponent() {
  const { owner, repo } = useParams({ from: Route.id })

  const searchParams = useSearch({ from: Route.id })
  const navigate = Route.useNavigate()

  useSWR(`pull-requests-${owner}-${repo}`, () => fetchRepoPullRequests(owner, repo))

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
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
