import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { CircleFadingArrowUp } from 'lucide-react'
import { formatCompactTimeAgo } from '@/lib/date'
import { Link } from '@/components/link'
import { useParams } from '@tanstack/react-router'
import { Route } from '@/routes/$owner/$repo/index'

type PRItem = RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][0]

interface PRListProps {
  prs: { items: PRItem[] } | undefined
  error: Error | null
}

export function PRList({ prs, error }: PRListProps) {
  const { owner, repo } = useParams({ from: Route.id })

  if (error) {
    return (
      <div className="text-destructive py-2">
        Failed to load pull requests: {error.message}
      </div>
    )
  }

  if (!prs || prs.items.length === 0) {
    return (
      <div className="text-muted-foreground py-2">
        No pull requests found.
      </div>
    )
  }

  return (
    <>
      {prs.items.map((pr) => (
        <div
          key={pr.id}
          className="relative flex items-center gap-3 hover:bg-accent/50 duration-200 px-3 rounded-md group py-3 after:content-[''] after:block after:h-px after:bg-accent/50 after:absolute after:bottom-0 after:left-[40px] after:right-[12px] last:after:hidden hover:after:bg-transparent"
        >
          <div className="text-muted-foreground flex-shrink-0">
            <CircleFadingArrowUp size={16} className="text-orange-500" />
          </div>

          <Link
            to="/$owner/$repo/pulls/$number/conversation"
            params={{ owner, repo, number: pr.number.toString() }}
            className="text-sm truncate flex-1 flex items-center justify-between"
          >
            <div className="truncate flex-1">
              <span>{pr.title}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <Avatar className="h-5 w-5 flex-shrink-0">
                <AvatarImage src={pr.user?.avatar_url} alt={pr.user?.login || 'User'} />
              </Avatar>

              <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                {formatCompactTimeAgo(new Date(pr.created_at))}
              </span>
            </div>
          </Link>
        </div>
      ))}
    </>
  )
}
