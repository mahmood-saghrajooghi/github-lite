import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { CircleArrowUp } from 'lucide-react'
import { formatCompactTimeAgo } from '@/lib/date'
import { Link } from '@/components/link'
import { useParams } from '@tanstack/react-router'
import { Route } from '@/routes/$owner/$repo/index'
import type { RepoCommitsQuery } from '@/generated/graphql'

type Target = NonNullable<NonNullable<NonNullable<RepoCommitsQuery['repository']>['ref']>['target']> & { __typename: 'Commit' };
type Commits = NonNullable<NonNullable<Target['history']>['nodes']>;

interface CommitListProps {
  commits: Commits;
  error: Error | null
}

export function CommitList({ commits, error }: CommitListProps) {
  const { owner, repo } = useParams({ from: Route.id })

  if (error) {
    return (
      <div className="text-destructive py-2">
        Failed to load commits: {error.message}
      </div>
    )
  }

  if (!commits || commits.length === 0) {
    return (
      <div className="text-muted-foreground py-2">
        No commits found.
      </div>
    )
  }

  return (
    <>
      {commits.map((commit) => (
          <div key={commit?.id} className="relative flex items-center gap-3 hover:bg-accent/50 duration-200 px-3 rounded-md group py-3 after:content-[''] after:block after:h-px after:bg-accent/50 after:absolute after:bottom-0 after:left-[40px] after:right-[12px] last:after:hidden hover:after:bg-transparent">
            <div className="text-muted-foreground flex-shrink-0">
              <CircleArrowUp size={16} className="text-blue-500" />
            </div>

            <Link
              to="/$owner/$repo/pulls/$number/conversation"
              params={{ owner, repo, number: commit?.associatedPullRequests?.nodes?.[0]?.number?.toString() ?? '' }}
              className="text-sm truncate flex-1 flex items-center justify-between "
            >
              {commit?.messageHeadline}
              <div className="flex items-center gap-3 flex-shrink-0">
                <Avatar className="h-5 w-5 flex-shrink-0">
                  <AvatarImage src={commit?.author?.avatarUrl ?? undefined} alt={commit?.author?.name ?? undefined} />
                </Avatar>

                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {formatCompactTimeAgo(new Date(commit?.committedDate))}
                </span>
              </div>
            </Link>
          </div>
      ))}
    </>
  )
}
