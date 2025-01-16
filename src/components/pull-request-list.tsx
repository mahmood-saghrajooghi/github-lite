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
  CommandInput,
} from '@/components/ui/command'
import { getPrURL } from '@/lib/pull-request'
import useSWR from 'swr'
import { github, preload, useQuery } from '@/lib/client'
import { PullRequestPage } from '@/app/PullRequest'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { Repository } from '@octokit/graphql-schema'
import { CircleCheck, X, Clock3, CheckIcon } from 'lucide-react'
import { GitPullRequestDraftIcon, GitPullRequestIcon } from '@primer/octicons-react'
import { Avatar } from '@/app/components'
import { HotkeyProvider } from './hotkey'
import { Input } from '@/components/ui/input'
import { BreadcrumbSeparator } from './ui/breadcrumb'
import { Separator } from './ui/separator'

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

export function PullRequestsList({ swrKey }: Props) {
  const { data } = useSWR(swrKey)
  const navigate = useNavigate()
  return (
    <Command className="bg-color-unset">
      <CommandInput placeholder="Search pull requests" />
      <CommandList className="max-h-[unset] px-2 py-2">
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
            className="group"
          >
            {/* TODO: add bg when user has input */}
            <SidebarMenuItem className="p-0 data-[selected=true]:bg-unset">
              <PullRequestItem item={item} />
            </SidebarMenuItem>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
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

  let reviews = [];
  if(res?.repository.pullRequest?.reviews?.nodes) {
    reviews = [...reviews, ...res?.repository.pullRequest?.reviews?.nodes.filter(({ state }) => state === 'APPROVED')]
  }
  if(res?.repository.pullRequest?.reviewRequests?.nodes) {
    reviews = [...reviews, ...res?.repository.pullRequest?.reviewRequests?.nodes]
  }

  console.log(reviews);

  return (
    <Link
      id={getPrURL(item)}
      to={getPrURL(item)}
      onMouseOver={() => {
        preloadPullRequest(item)
      }}
      className="overflow-hidden block flex-1 px-2 h-9 flex items-center rounded-md transition-colors group-data-[selected=true]:bg-muted/50"
      activeProps={{
        className: 'bg-muted',
      }}
    >
      <div className="flex flex-1 flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium flex items-end gap-1 min-w-0">
              {item.draft ? (
                <GitPullRequestDraftIcon className="text-muted-foreground" />
              ) : (
                item.state === 'open' && (
                  <GitPullRequestIcon className="text-green-500" />
                )
              )}
              <span className="text-foreground truncate">{item.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {reviews?.map((node, index) => (
              <div key={node?.requestedReviewer?.login ?? index} className="w-5 flex justify-center relative">
                <Avatar src={node?.requestedReviewer?.avatarUrl || node.author?.avatarUrl} size="s" />
                {node?.state === 'APPROVED' && (
                  <div className="absolute bottom-0 right-0 translate-x-[4px] translate-y-[4px] rounded-full bg-green-500 w-2.5 h-2.5 flex items-center justify-center">
                    <CheckIcon className="text-white !w-2 !h-2" />
                  </div>
                )}
              </div>
            ))}
            {/* <Separator orientation="vertical" className="h-4" />
            <Avatar src={item.user?.avatar_url ?? ''} size="s" /> */}
          </div>
        </div>
      </div>
    </Link>
  )
}
