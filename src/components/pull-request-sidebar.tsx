import { Link, UseNavigateResult } from '@tanstack/react-router'
import { omit } from 'lodash'
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
import { RestEndpointMethodTypes } from '@octokit/rest'
import { CircleCheck, X, Clock3, User, Check, Loader, ListFilterIcon } from 'lucide-react'
import { GitPullRequestDraftIcon, GitPullRequestIcon } from '@primer/octicons-react'
import { Avatar } from '@/app/components'
import { useRegisterHotkey } from '@/contexts/hotkey-context'
import { useRef, useState } from 'react'
import { Button, ButtonIcon } from './ui/button'
import { cn } from '@/lib/utils'
import { usePRsQuery } from '@/hooks/api/use-prs-query'
import { usePRQuery } from '@/hooks/api/use-pr-query'
import { useRepoCollaborators } from '@/hooks/api/use-repo-members'
import { prSearchSchema } from '@/lib/pr-search.scema'
import { z } from 'zod'
import isHotkey from 'is-hotkey'

type PullRequest =
  RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][0]

type SearchParams = z.infer<typeof prSearchSchema>

type Navigate = UseNavigateResult<"/pulls/$owner/$repo"> | UseNavigateResult<"/pulls/$owner/$repo/$number/conversation">

type Props = {
  owner: string
  repo: string
  searchParams: SearchParams
  navigate: Navigate
}

export function PullRequestsSidebar({ owner, repo, searchParams, navigate }: Props) {
  const { author, state, sort } = searchParams;

  function onSearchChange(key: string, value: string) {
    navigate({
      search: value ? {
        ...searchParams,
        [key]: value,
      } : omit(searchParams, key) as SearchParams,
    })
  }

  const { data, isLoading } = usePRsQuery(owner, repo, { author, state, sort })
  const ref = useRef<HTMLInputElement>(null)

  useRegisterHotkey('/', (event) => {
    event?.preventDefault()
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
            <CommandInput
              placeholder="Search pull requests"
              wrapperClassName="w-full h-full"
              ref={ref}
              onKeyDown={(event) => {
                if (isHotkey(['meta+l', 'arrowRight'], event)) {
                  event.preventDefault()
                  const commentCard = document.querySelector('[data-quick-focus]')
                  if (commentCard) {
                    ref.current?.blur();
                    (commentCard as HTMLElement).focus();
                    (commentCard as HTMLElement).scrollIntoView();
                  }
                }

                if (isHotkey('esc', event)) {
                  ref.current?.blur()
                }
              }}
            />
          </SidebarHeader>
          <SidebarContent className="p-2">
            <div className="flex items-center gap-2 justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <AuthorFilter value={author} onChange={(value) => onSearchChange('author', value)} owner={owner} repo={repo} />
                <StateFilter value={state} onChange={(value) => onSearchChange('state', value)} />
                <SortFilter value={sort} onChange={(value) => onSearchChange('sort', value)} />
              </div>
              {isLoading && <Loader className="w-4 h-4 animate-spin [animation-duration:1500ms] text-muted-foreground" />}
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
                        to: getPrURL(item as { repository_url: string, pull_request: { url: string } }),
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

  const { data: res } = usePRQuery(owner, repo, number);

  return (
    <Link
      id={getPrURL(item as { repository_url: string, pull_request: { url: string } })}
      to={getPrURL(item as { repository_url: string, pull_request: { url: string } })}
      search={searchParams}
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


export function AuthorFilter({ value, onChange, owner, repo }: { value: string | undefined, onChange: (value: string) => void, owner: string, repo: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false)

  useRegisterHotkey('u', (event) => {
    event?.preventDefault()
    setOpen(true)
  })

  const { data } = useRepoCollaborators(owner, repo)

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
        <Command onChange={() => {
          queueMicrotask(() => {
            listRef.current?.scrollTo({ top: 0 })
          })
        }}>
          <CommandInput placeholder="Search framework..." />
          <CommandList ref={listRef}>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {data?.repository?.collaborators?.nodes?.map((member) => (
                <CommandItem
                  key={member?.login}
                  value={member?.login}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  <Avatar src={member?.avatarUrl} size="s" />
                  {member?.name}
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === member?.login ? "opacity-100" : "opacity-0"
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

export function StateFilter({ value, onChange }: { value: string | undefined, onChange: (value: string) => void }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false)

  useRegisterHotkey('s t', (event) => {
    event?.preventDefault()
    setOpen(true)
  })

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
            <ListFilterIcon className="h-4 w-4 shrink-0" />
          </ButtonIcon>
          {value ? value : "State"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0" align="start">
        <Command onChange={() => {
          queueMicrotask(() => {
            listRef.current?.scrollTo({ top: 0 })
          })
        }}>
          <CommandInput placeholder="Search pull request state..." />
          <CommandList ref={listRef}>
            <CommandEmpty>No pull request state found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key="open"
                value="open"
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
                className="overflow-hidden text-ellipsis whitespace-nowrap"
              >
                Open
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "open" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              <CommandItem
                key="closed"
                value="closed"
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
                className="overflow-hidden text-ellipsis whitespace-nowrap"
              >
                Closed
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "closed" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              <CommandItem
                key="merged"
                value="merged"
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
                className="overflow-hidden text-ellipsis whitespace-nowrap"
              >
                Merged
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "merged" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
              <CommandItem
                key="draft"
                value="draft"
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
                className="overflow-hidden text-ellipsis whitespace-nowrap"
              >
                Draft
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "draft" ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type SortOption = {
  label: string;
  value: string;
}
const sortOptions: SortOption[] = [
  { label: "Newest", value: "created-desc" },
  { label: "Oldest", value: "created-asc" },
  { label: "Most commented", value: "comments-desc" },
  { label: "Least commented", value: "comments-asc" },
  { label: "Recently updated", value: "updated-desc" },
  { label: "Least recently updated", value: "updated-asc" },
  { label: "Best match", value: "relevance-desc" },
];

function SortFilter({ value, onChange }: { value: string | undefined, onChange: (value: string) => void }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false)

  useRegisterHotkey('s b', (event) => {
    event?.preventDefault()
    setOpen(true)
  })


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
            <ListFilterIcon className="h-4 w-4 shrink-0" />
          </ButtonIcon>
          {value ? value : "Sort by"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0" align="start">
        <Command onChange={() => {
          queueMicrotask(() => {
            listRef.current?.scrollTo({ top: 0 })
          })
        }}>
          <CommandInput placeholder="Search pull request state..." />
          <CommandList ref={listRef}>
            <CommandEmpty>No pull request state found.</CommandEmpty>
            <CommandGroup>
              {sortOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue)
                    setOpen(false)
                  }}
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                >
                  {option.label}
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
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
