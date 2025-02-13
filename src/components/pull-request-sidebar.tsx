import { getRouteApi, Link, useParams } from '@tanstack/react-router'
import { gql } from 'graphql-tag'

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
  CommandGroup,
  CommandList,
  CommandItem,
  CommandInput,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getPrURL } from '@/lib/pull-request'
import useSWR from 'swr'
import { github, preload, useQuery } from '@/lib/client'
import { PullRequestPage } from '@/app/PullRequest'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { Repository } from '@octokit/graphql-schema'
import { CircleCheck, X, Clock3, User, Check } from 'lucide-react'
import { GitPullRequestDraftIcon, GitPullRequestIcon } from '@primer/octicons-react'
import { Avatar } from '@/app/components'
import { useRegisterHotkey } from '@/contexts/hotkey-context'
import { useRef, useState } from 'react'
import { Button, ButtonIcon } from './ui/button'
import { cn } from '@/lib/utils'

type PullRequest =
  RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][0]

function preloadPullRequest(item: PullRequest) {
  preload(PullRequestPage.query(), {
    owner: item.repository?.owner.login,
    repo: item.repository?.name,
    number: Number(item.url.split('/').pop()),
  })
}

type SearchParams = {
  author?: string
}


type Props = {
  owner: string
  repo: string
  searchParams: SearchParams
  navigate: (params: { search: { author?: string } | undefined }) => void
}

export function PullRequestsSidebar({ owner, repo, searchParams, navigate }: Props) {
  const { author } = searchParams;

  function onAuthorChange(value: string) {
    navigate({
      search: value? {
        author: value,
      } : undefined,
    })
  }

  function getSwrKey(params: { author?: string }) {
    let key = `pull-requests-${owner}-${repo}`
    Object.entries(params).forEach(([paramKey, value]) => {
      if (value) {
        key += `?${paramKey}=${value}`
      }
    })
    return key
  }

  const { data } = useSWR(getSwrKey({ author }))
  const ref = useRef<HTMLInputElement>(null)

  useRegisterHotkey('/', () => {
    ref.current?.focus()
  })

  return (
    <SidebarProvider
      style={{ '--sidebar-width': '360px' } as React.CSSProperties}
      className="min-h-[unset]"
    >
      <Command className="bg-color-unset rounded-none">
        <Sidebar collapsible="none" className="bg-color-unset border-r">
          <SidebarHeader className="text-sm flex flex-row items-center h-12 p-0">
            <CommandInput placeholder="Search pull requests" wrapperClassName="w-full h-full" ref={ref} autoFocus />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <div className="flex items-center gap-2">
              <AuthorFilter value={author} onChange={onAuthorChange} />
            </div>
            <SidebarMenu>
              <CommandList className="max-h-[unset] overflow-y-auto">
                <CommandEmpty>No results found.</CommandEmpty>
                {data?.items.map((item: PullRequest) => (
                  <CommandItem
                    key={item.id}
                    value={item.title.toString()}
                    onSelect={() => {
                      navigate({
                        to: getPrURL(item),
                        search: searchParams,
                      })
                    }}
                    asChild
                  >
                    {/* TODO: add bg when user has input */}
                    <SidebarMenuItem className="p-0 data-[selected=true]:bg-accent/50">
                      <PullRequestItem item={item} searchParams={searchParams} />
                    </SidebarMenuItem>
                  </CommandItem>
                ))}
              </CommandList>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter />
        </Sidebar>
      </Command>

    </SidebarProvider>
  )
}

function PullRequestItem({ item, searchParams }: { item: PullRequest, searchParams: SearchParams }) {
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
      search={searchParams}
      onMouseOver={() => {
        preloadPullRequest(item)
      }}
      className="overflow-hidden block flex-1 px-2 py-1.5"
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

const memebersQuery = `
  query members {
    organization(login: "Flowsystem") {
      membersWithRole(first: 100) {
        nodes {
          login
          avatarUrl
          name
        }
      }
    }
  }
`

type Member = {
  login: string
  avatarUrl: string
  name: string
}

export function AuthorFilter({ value, onChange }: { value: string | undefined, onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)

  useRegisterHotkey('u', () => {
    setOpen(true)
  })

  const { data } = useQuery<{ organization: { membersWithRole: { nodes: Member[] } } }>(memebersQuery, {})

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          className="max-w-[200px] justify-between"
        >
          <ButtonIcon>
            <User className="h-4 w-4 shrink-0" />
          </ButtonIcon>
          {value ? value : "Author"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0" align="start">
        <Command>
          <CommandInput placeholder="Search framework..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {data?.organization?.membersWithRole?.nodes.map((member) => (
                <CommandItem
                  key={member.login}
                  value={member.login}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  <Avatar src={member.avatarUrl} size="s" />
                  {member.name}
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === member.login ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
