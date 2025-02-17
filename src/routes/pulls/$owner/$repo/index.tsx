import { AppHeader } from '@/components/app-header'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbLink } from '@/components/ui/breadcrumb'
import { createFileRoute, useParams, useSearch } from '@tanstack/react-router'
import { PullRequestsSidebar } from '@/components/pull-request-sidebar'
import { github } from '@/lib/client'
import useSWR from 'swr'
import { z } from 'zod'
import { Link } from '@/components/link'

const searchSchema = z.object({
  author: z.string().optional(),
})

export const Route = createFileRoute('/pulls/$owner/$repo/')({
  component: RouteComponent,
  validateSearch: (search) => searchSchema.parse(search),
})
async function fetchRepoPullRequests(owner: string, repo: string, search: any) {
  try {
    let query = `is:pr is:open repo:${owner}/${repo}`

    if (search.author) {
      query += ` author:${search.author}`
    }

    const res = await github.search.issuesAndPullRequests({
      q: query,
      per_page: 200,
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


  function getSwrKey(params: { author?: string }) {
    let key = `pull-requests-${owner}-${repo}`
    Object.entries(params).forEach(([paramKey, value]) => {
      if (value) {
        key += `?${paramKey}=${value}`
      }
    })
    return key
  }

  useSWR(getSwrKey({ author: searchParams.author }), () => fetchRepoPullRequests(owner, repo, searchParams), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: true,
  })

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
