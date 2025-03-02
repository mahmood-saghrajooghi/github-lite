import { createFileRoute, useParams } from '@tanstack/react-router'
import { PullRequestContextProvider, PullHeader } from '@/app/PullRequest'
import { CommentCard } from '@/components/comment-card/comment-card'
import { Timeline } from '@/app/timeline/timeline'
import { IssueCommentForm } from '@/app/CommentForm'
import { Header } from '@/app/Issue'
import { ErrorBoundary } from 'react-error-boundary'
import { IssueStatus } from '@/app/components'
import { PullRequestsSidebar } from '@/components/pull-request-sidebar'
import { getQueryKey, usePRQuery } from '@/hooks/api/use-pr-query'
import { prSearchSchema } from '@/lib/pr-search.scema'
import { QuickFocus } from '@/components/quick-focus'
import { ReplyTrap } from '@/components/ui/reply-trap'
import { IssueTimelineQuery, PullRequest, PullRequestTimelineItems } from '@/generated/graphql'
import { User } from '@octokit/graphql-schema'
import { zodValidator } from '@tanstack/zod-adapter'
import { github } from '@/lib/client'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/query-client'
import { useUser } from '@/hooks/api/use-user'

export const Route = createFileRoute(
  '/pulls/$owner/$repo/$number/_header/conversation',
)({
  component: RouteComponent,
  validateSearch: zodValidator(prSearchSchema),
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
  const { data: res } = usePRQuery(owner, repo, Number(number))


  const navigate = Route.useNavigate()
  const searchParams = Route.useSearch()

  const pr = res?.repository?.pullRequest

  const { mutate: addComment } = useMutation({
    mutationFn: async (comment: string) => {
      await github.graphql(/* GraphQL */`
        mutation CreateIssueComment($input: AddCommentInput!) {
          addComment(input: $input) {
            commentEdge {
              node {
                ... on IssueComment {
                  id
                }
              }
            }
          }
        }
      `, {
        input: {
          body: comment,
          subjectId: pr?.id
        }
      });
    }
  });

  const { data: user } = useUser();

  const handleSubmit = async (comment: string) => {
    optimisticallyUpdatePullRequest({ owner: owner, repo: repo, number: Number(number), user, values: { comment } });
    await addComment(comment)
    queryClient.invalidateQueries({ queryKey: getQueryKey(owner, repo, Number(number)) });
  }

  if (!pr) {
    return null
  }

  return (
    <div
      className="grid grid-cols-[auto_1fr] grid-rows-[1fr] overflow-hidden"
    >
      <PullRequestsSidebar
        owner={owner}
        repo={repo}
        searchParams={searchParams}
        navigate={navigate}
      />
      <div className="flex flex-col gap-4 relative overflow-y-auto">
        <PullRequestContextProvider pr={pr as PullRequest}>
          <Header data={pr as PullRequest} />
          <main className="flex flex-col gap-4 px-4 pb-4
          jj">
            <div className="flex gap-2 items-center bg-muted/50 rounded-lg py-2 px-3">
              <div className="text-sm">
                <IssueStatus data={pr as PullRequest} />
              </div>
              <span className="text-sm">
                <a
                  target="_blank"
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  href={pr.url
                    .split('/pull')[0]
                    .split('/')
                    .slice(0, -1)
                    .join('/')}
                >
                  {pr.repository.owner.login}
                </a>
                /
                <a
                  target="_blank"
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  href={pr.url.split('/pull')[0]}
                >
                  {pr.repository.name}
                </a>
                /
                <a
                  target="_blank"
                  className="cursor-pointer hover:text-blue-500 hover:underline"
                  href={pr.url}
                >
                  #{pr.number}
                </a>
              </span>
            </div>
            <div className="grid grid-cols-[1fr_300px] gap-4">
              <CommentCard data={pr as PullRequest} />
              <PullHeader data={pr as PullRequest} />
            </div>
            <Timeline items={pr.timelineItems.nodes! as PullRequestTimelineItems[]} />
            <ReplyTrap asChild>
              <QuickFocus asChild>
                <IssueCommentForm issue={pr as PullRequest} onSubmit={handleSubmit} />
              </QuickFocus>
            </ReplyTrap>
          </main>
        </PullRequestContextProvider>
      </div>
    </div>
  )
}

function optimisticallyUpdatePullRequest({ owner, repo, number, user, values }: { owner: string, repo: string, number: number, user: User | undefined, values: { comment: string } }) {
  if (!user) {
    return
  }

  queryClient.setQueryData(getQueryKey(owner, repo, number), (data: IssueTimelineQuery) => {
    return {
      ...data,
      repository: {
        ...data.repository,
        pullRequest: {
          ...data.repository?.pullRequest,
          timelineItems: {
            nodes: [
              ...(data.repository?.pullRequest?.timelineItems.nodes ?? []),
              {
                __typename: "IssueComment",
                author: { login: user?.login, avatarUrl: user?.avatarUrl, url: user?.url },
                body: values.comment,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                url: `https://github.com/${owner}/${repo}/issues/${number}/comments`,
                id: "1",
                reactionGroups: data.repository?.pullRequest?.reactionGroups
              }
            ]
          }
        }
      }
    }
  });
}
