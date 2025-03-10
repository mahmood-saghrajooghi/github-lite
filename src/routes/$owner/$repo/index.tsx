import { AppHeader } from '@/components/app-header'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { Link } from '@/components/link'
import { useRepoCommits } from '@/hooks/api/use-repo-commits'
import { CommitList } from '@/components/commit-list'
import { PRList } from '@/components/pr-list'

export const Route = createFileRoute('/$owner/$repo/')({
  component: RouteComponent,
})

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePRsQuery } from '@/hooks/api/use-prs-query'
import { RepoCommitsQuery } from '@/generated/graphql'
function RouteComponent() {
  const { owner, repo } = useParams({ from: Route.id })
  const { data: commitsData, error: commitsError } = useRepoCommits(owner, repo);
  const { data: activePRsData, error: activePRsError } = usePRsQuery(owner, repo, {
    state: 'open',
    perPage: 5,
  })

  type Target = NonNullable<NonNullable<RepoCommitsQuery['repository']>['ref']>['target'] & { __typename: 'Commit' };

  const target = commitsData?.repository?.ref?.target;
  let commits: NonNullable<Target['history']>['nodes'] = [];

  if (target?.__typename === 'Commit') {
    commits = target.history.nodes;
  }

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  to="/$owner/$repo"
                  params={{ owner, repo }}
                >
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </AppHeader>

      <div className="container p-6">
        <h1 className="text-2xl font-bold mb-6">{repo}</h1>
        <div className="h-px w-[calc(100%+3rem)] bg-accent/50 -ml-6" />
        <div className="mt-4">
          <Card className="border-none">
            <CardHeader className="pb-2 pt-0 px-4 border-b border-accent/50 flex-row justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">In progress</CardTitle>
              <Link
                className="text-xs text-muted-foreground hover:text-foreground duration-200"
                to="/$owner/$repo"
                params={{ owner, repo }}
              >
                See all
              </Link>
            </CardHeader>
            <CardContent className="py-2 px-1">
              <PRList
                prs={activePRsData}
                error={activePRsError instanceof Error ? activePRsError : null}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-4">
          <Card className="border-none">
            <CardHeader className="pb-2 pt-0 px-4 border-b border-accent/50 flex-row justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Merged</CardTitle>
              <Link
                className="text-xs text-muted-foreground hover:text-foreground duration-200"
                to="/$owner/$repo"
                params={{ owner, repo }}
              >
                See all
              </Link>
            </CardHeader>
            <CardContent className="py-2 px-1">
              <CommitList
                commits={commits}
                error={commitsError instanceof Error ? commitsError : null}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
