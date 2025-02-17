import { AppHeader } from '@/components/app-header'
import { PullRequestsList } from '@/components/pull-request-list'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from '@/components/ui/breadcrumb'
import { Link } from '@/components/link'
import { github } from '@/lib/client'
import { createFileRoute } from '@tanstack/react-router'
import useSWR from 'swr'

export const Route = createFileRoute('/pulls/')({
  component: RouteComponent,
})

async function fetchIssues() {
  try {
    const res = await github.search.issuesAndPullRequests({
      q: 'is:pr is:open author:@me',
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

const SWR_KEY = 'pull-requests'

function RouteComponent() {
  useSWR(SWR_KEY, fetchIssues)

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
        <PullRequestsList swrKey={SWR_KEY} />
      </div>
    </>
  )
}
