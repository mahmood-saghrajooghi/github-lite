import { Link, useNavigate, } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar'
import {
  Command,
  CommandEmpty,
  CommandList,
  CommandItem,
} from '@/components/ui/command'
import { getPrURL } from '@/lib/pull-request'
import useSWR from 'swr'
import { github, preload, useQuery } from '@/lib/client'
import { PullRequestPage } from '@/app/PullRequest'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { Repository } from '@octokit/graphql-schema'
import { CircleCheck, X, Clock3 } from 'lucide-react'
import { GitPullRequestDraftIcon, GitPullRequestIcon } from '@primer/octicons-react'
import { Avatar } from '@/app/components'
import { HotkeyProvider } from './hotkey'

type PullRequest =
  RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][0]

function preloadPullRequest(item: PullRequest) {
  preload(PullRequestPage.query(), {
    owner: item.repository?.owner.login,
    repo: item.repository?.name,
    number: Number(item.url.split('/').pop()),
  })
}

type Props = {
  swrKey: string
}

export function PullRequestsSidebar({ swrKey }: Props) {
  const { data } = useSWR(swrKey)
  const navigate = useNavigate()
  return (
    <SidebarProvider
      style={{ '--sidebar-width': '360px' } as React.CSSProperties}
      className="min-h-[unset]"
    >
      <Sidebar collapsible="none" className="bg-color-unset border-r">
        <SidebarHeader className="border-b text-sm flex flex-row items-center h-12 pl-4 py-0">
          Pull Requests
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <Command className="bg-color-unset">
              <CommandList className="max-h-[unset]">
                <CommandEmpty>No results found.</CommandEmpty>
                {data?.items.map((item: PullRequest) => (
                  <CommandItem
                    key={item.id}
                    value={item.title.toString()}
                    onSelect={() => {
                      navigate({
                        to: getPrURL(item),
                      })
                    }}
                    asChild
                  >
                    {/* TODO: add bg when user has input */}
                    <SidebarMenuItem className="p-0 data-[selected=true]:bg-unset">
                      <PullRequestItem item={item} />
                    </SidebarMenuItem>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
    </SidebarProvider>
  )
}

function PullRequestItem({ item }: { item: PullRequest }) {
  const repoURL = item.repository_url
  const [owner, repo] = repoURL.split('/').slice(-2)
  const number = Number(item.url.split('/').pop())
  const { data: res } = useQuery<{ repository: Repository }>(
    PullRequestPage.query(),
    { owner, repo, number },
  )

  return (
    <Link
      id={getPrURL(item)}
      to={getPrURL(item)}
      onMouseOver={() => {
        preloadPullRequest(item)
      }}
      className="overflow-hidden block flex-1 px-2 py-1.5 rounded-md hover:bg-accent"
      activeProps={{
        className: 'bg-muted',
      }}
    >
      <div className="flex flex-1 flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="text-xs font-medium flex items-end gap-1 min-w-0">
            <span className="text-muted-foreground shrink-0">
              #{item.url?.split('/').pop()}
            </span>
            <span className="text-foreground truncate">{item.title}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Avatar src={item.user?.avatar_url ?? ''} size="s" />
            {item.draft ? (
              <GitPullRequestDraftIcon className="text-muted-foreground" />
            ) : (
              item.state === 'open' && (
                <GitPullRequestIcon className="text-green-700" />
              )
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          <div className="flex items-center gap-1">
            {res?.repository?.pullRequest?.reviewDecision ===
              'REVIEW_REQUIRED' ? (
              <>
                <Clock3 className="!w-4 !h-4" />
                In review
              </>
            ) : res?.repository?.pullRequest?.reviewDecision === 'APPROVED' ? (
              <>
                <CircleCheck className="text-green-500" />
                Approved
              </>
            ) : res?.repository?.pullRequest?.reviewDecision ===
              'CHANGES_REQUESTED' ? (
              <>
                <X className="text-red-500" />
                Changes requested
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
