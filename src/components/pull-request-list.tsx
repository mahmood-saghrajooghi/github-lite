import { useRef } from 'react'
import { motion } from 'motion/react'
import { Link, useNavigate, } from '@tanstack/react-router'
import { SidebarMenuItem } from '@/components/ui/sidebar'
import { useQuery } from '@tanstack/react-query'
import {
  Command,
  CommandEmpty,
  CommandList,
  CommandItem,
  CommandInput,
} from '@/components/ui/command'
import { getPrURL } from '@/lib/pull-request'
import { preload, runQuery } from '@/lib/client'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { Repository } from '@octokit/graphql-schema'
import { CheckIcon } from 'lucide-react'
import { GitPullRequestDraftIcon, GitPullRequestIcon } from '@primer/octicons-react'
import { Avatar } from '@/app/components'
import { useHotkey, useRegisterHotkey } from '@/contexts/hotkey-context'
import { useMyPRs } from '@/hooks/api/use-my-prs'
import { issueTimeline } from '@/app/issue-timeline.query.graphql'

type PullRequest =
  RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][0]

function preloadPullRequest({ owner, repo, number }: { owner: string, repo: string, number: number }) {
  preload(issueTimeline, {
    owner,
    repo,
    number,
  })
}

export function PullRequestsList() {
  const ref = useRef<HTMLInputElement>(null)
  const { data } = useMyPRs()
  const navigate = useNavigate()
  const { isMetaKeyPressed } = useHotkey()

  useRegisterHotkey('/', (event) => {
    event?.preventDefault()
    ref.current?.focus()
  })

  return (
    <Command className="bg-color-unset">
      <CommandInput
        placeholder="Search pull requests"
        ref={ref}
        onKeyDown={(e) => {
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            e.stopPropagation();
            navigate({
              to: getPrURL(data?.items[Number(e.key) - 1]),
            })
          }
        }}
      />
      <CommandList className="max-h-[unset] px-2 py-2">
        <CommandEmpty>No results found.</CommandEmpty>
        {data?.items.map((item: PullRequest, index: number) => (
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
              <PullRequestItem item={item} index={index} isMetaKeyPressed={isMetaKeyPressed} />
            </SidebarMenuItem>
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  )
}

type PullRequestItemProps = {
  item: PullRequest
  index: number
  isMetaKeyPressed: boolean
}

function PullRequestItem({ item, index, isMetaKeyPressed }: PullRequestItemProps) {
  const repoURL = item.repository_url
  const [owner, repo] = repoURL.split('/').slice(-2)
  const number = Number(item.url.split('/').pop())
  const { data: res } = useQuery<{ repository: Repository }>({
    queryKey: [PullRequestPage.query(), { owner, repo, number }],
    queryFn: () => runQuery([PullRequestPage.query(), { owner, repo, number }]),
  })

  let reviews = [];
  if (res?.repository.pullRequest?.reviews?.nodes) {
    reviews = [...reviews, ...res?.repository.pullRequest?.reviews?.nodes.filter(({ state }) => state === 'APPROVED')]
  }
  if (res?.repository.pullRequest?.reviewRequests?.nodes) {
    reviews = [...reviews, ...res?.repository.pullRequest?.reviewRequests?.nodes]
  }

  return (
    <Link
      id={getPrURL(item)}
      to={getPrURL(item)}
      onMouseOver={() => {
        preloadPullRequest({
          owner,
          repo,
          number,
        })
      }}
      className="overflow-hidden block flex-1 px-2 h-9 flex items-center rounded-md transition-colors group-data-[selected=true]:bg-muted/50"
      activeProps={{
        className: 'bg-muted',
      }}
    >
      <div className="flex flex-1 flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium flex items-end gap-2 min-w-0">
              <div className="relative">
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={isMetaKeyPressed ? { opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: .1 }}
                >
                  <PullRequestItemIcon item={item} />
                </motion.div>
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={isMetaKeyPressed ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: .1 }}
                  className="text-muted-foreground absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
                >
                  {index + 1}
                </motion.div>
              </div>
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

function PullRequestItemIcon({ item }: { item: PullRequest }) {
  return item.draft ? (
    <GitPullRequestDraftIcon className="text-muted-foreground" />
  ) : (
    item.state === 'open' && (
      <GitPullRequestIcon className="text-green-500" />
    )
  )
}
