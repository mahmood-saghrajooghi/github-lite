import {
  createFileRoute,
  Outlet,
  useParams,
} from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb'
import { CommentDiscussionIcon, FileDiffIcon } from '@primer/octicons-react'
import { AppHeader } from '@/components/app-header'
import { TabLink, TabLinkIcon } from '@/components/tab-link'
import { Link } from '@/components/Link'
import { github } from '@/lib/client'
import useSWR from 'swr'

export const Route = createFileRoute('/pulls/$owner/$repo/$number/_header')({
  component: RouteComponent,
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
  const { owner, repo, number } = useParams({ from: Route.id })

  useSWR(`pull-requests-${owner}-${repo}`, () => fetchRepoPullRequests(owner, repo))

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={'/pulls'} hotKey="p">Pull requests</Link>
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
            <BreadcrumbSeparator />
            <BreadcrumbItem>#{number}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">

          <TabLink
            to="/pulls/$owner/$repo/$number/conversation"
            params={{ owner, repo, number }}
            hotKey="c"
          >

            <TabLinkIcon>
              <CommentDiscussionIcon className="!w-3.5 !h-3.5 " />
            </TabLinkIcon>
            Conversation
          </TabLink>


          <TabLink
            to="/pulls/$owner/$repo/$number/file-changes"
            params={{ owner, repo, number }}
            hotKey="f"
          >
            <TabLinkIcon>
              <FileDiffIcon className="!w-3.5 !h-3.5" />
            </TabLinkIcon>
            Files changed
          </TabLink>
        </div>
      </AppHeader>
      <Outlet />
    </>
  )
}
