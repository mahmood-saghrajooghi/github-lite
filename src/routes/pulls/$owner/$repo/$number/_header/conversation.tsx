import { Repository } from '@octokit/graphql-schema'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { useQuery } from '@/lib/client'
import {
  PullRequestPage,
  PullRequestContext,
  PullHeader,
} from '@/app/PullRequest'
import { CommentCard } from '@/app/CommentCard'
import { Timeline } from '@/app/TimeLine'
import { IssueCommentForm } from '@/app/CommentForm'
import { Header } from '@/app/Issue'
import { ErrorBoundary } from 'react-error-boundary'
import { IssueStatus } from '@/app/components'
import { PullRequestsSidebar } from '@/components/pull-request-sidebar'

export const Route = createFileRoute(
  '/pulls/$owner/$repo/$number/_header/conversation',
)({
  component: RouteComponent,
})

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 my-8">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <pre className="p-4 bg-red-500 rounded-lg text-sm">{error.message}</pre>
    </div>
  )
}

function RouteComponent() {
  const { owner, repo, number } = useParams({ from: Route.id })

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <PullRequestContent owner={owner} repo={repo} number={number} />
    </ErrorBoundary>
  )
}

function PullRequestContent({
  owner,
  repo,
  number,
}: {
  owner: string
  repo: string
  number: string
}) {
  const { data: res } = useQuery<{ repository: Repository }>(
    PullRequestPage.query(),
    { owner, repo, number: Number(number) },
  )

  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()

  const data = res?.repository.pullRequest

  if (!data) {
    return null
  }

  return (
    <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr]">
      <PullRequestsSidebar
        owner={owner}
        repo={repo}
        searchParams={searchParams}
        navigate={navigate}
      />
      <div className="flex flex-col gap-4 ">
        <PullRequestContext.Provider value={data}>
          <Header data={data} />
          <main className="flex flex-col gap-4 px-4">
            <div className="flex gap-2 items-center bg-muted/50 rounded-lg py-2 px-3">
              <div className="text-sm">
                <IssueStatus data={data} />
              </div>
              <span className="text-sm">
                <a
                  target="_blank"
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  href={data.url
                    .split('/pull')[0]
                    .split('/')
                    .slice(0, -1)
                    .join('/')}
                >
                  {data.repository.owner.login}
                </a>
                /
                <a
                  target="_blank"
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  href={data.url.split('/pull')[0]}
                >
                  {data.repository.name}
                </a>
                /
                <a
                  target="_blank"
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  href={data.url}
                >
                  #{data.number}
                </a>
              </span>
            </div>

            <CommentCard data={data} />
            <PullHeader data={data} />
            <Timeline items={data.timelineItems.nodes!} />
            <IssueCommentForm issue={data} />
          </main>
        </PullRequestContext.Provider>
      </div>
    </div>
  )
}
