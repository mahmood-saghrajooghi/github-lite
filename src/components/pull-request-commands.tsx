import { createPortal } from 'react-dom'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  User,
  Copy,
  Check,
  ListFilter as ListFilterIcon,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { MarkGithubIcon } from '@primer/octicons-react'
import { usePRQuery } from '@/hooks/api/use-pr-query'
import { useRepoCollaborators } from '@/hooks/api/use-repo-members'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { omit } from 'lodash'
import { prSearchSchema } from '@/lib/pr-search.scema'
import { z } from 'zod'
import isHotkey from 'is-hotkey'
import { useRegisterHotkey } from '@/contexts/hotkey-context'
import { Kbd } from './ui/kbd'

type Props = {
  owner: string
  repo: string
  number: string
}

type SortOption = {
  label: string;
  value: string;
}

type SearchParams = z.infer<typeof prSearchSchema>

const sortOptions: SortOption[] = [
  { label: "Newest", value: "created-desc" },
  { label: "Oldest", value: "created-asc" },
  { label: "Most commented", value: "comments-desc" },
  { label: "Least commented", value: "comments-asc" },
  { label: "Recently updated", value: "updated-desc" },
  { label: "Least recently updated", value: "updated-asc" },
  { label: "Best match", value: "relevance-desc" },
];

const stateOptions = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Merged", value: "merged" },
  { label: "Draft", value: "draft" },
];

export function PullRequestCommands({ owner, repo, number }: Props) {
  const { data: pr } = usePRQuery(owner, repo, Number(number))
  const ref = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  const [inputValue, setInputValue] = useState('')

  const [isOpen, setIsOpen] = useState(false)

  const [pages, setPages] = useState<string[]>(['home'])
  const activePage = pages[pages.length - 1]
  const isHome = activePage === 'home'

  const searchParams = useSearch({ from: '/$owner/$repo/pulls/$number/_header' }) as SearchParams;
  const navigate = useNavigate({ from: '/$owner/$repo/pulls/$number/conversation' })

  const popPage = useCallback(() => {
    setPages((pages) => {
      const x = [...pages]
      x.splice(-1, 1)
      return x
    })
  }, [])

  const resetPages = useCallback(() => {
    setPages(['home'])
  }, [])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      queueMicrotask(() => {
        if (listRef.current) {
          listRef.current.scrollTo({
            top: 0,
          })
        }
      })

      if (e.key === 'Escape') {
        setIsOpen(false);
        resetPages();
        setInputValue('');
      }

      if (isHome || inputValue.length > 0) {
        return
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        popPage()
        bounce()
      }

      if (e.key === 'Enter') {
        bounce()
      }
    },
    [inputValue.length, isHome, popPage, resetPages],
  )

  function bounce() {
    if (ref.current) {
      ref.current.style.transform = 'scale(0.96)'
      setTimeout(() => {
        if (ref.current) {
          ref.current.style.transform = ''
        }
      }, 100)

      setInputValue('')
    }
  }

  function onSearchChange(key: string, value: string) {
    navigate({
      search: value ? {
        ...searchParams,
        [key]: value,
      } : omit(searchParams, key) as SearchParams,
    })
  }

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHotkey('mod+k', e)) {
        setIsOpen((isOpen) => !isOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown, { signal })

    return () => {
      controller.abort()
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const openPRInGithub = useCallback(() => {
    window.open(`https://github.com/${owner}/${repo}/pull/${number}`, '_blank')
  }, [owner, repo, number])

  const copyBranchName = useCallback(() => {
    navigator.clipboard.writeText(pr?.repository?.pullRequest?.headRef?.name ?? '')
  }, [pr])

  useRegisterHotkey('o g', openPRInGithub)
  useRegisterHotkey('c n', copyBranchName)

  if (!isOpen) {
    return null
  }

  return createPortal((
    <div className="fixed top-[30vh] left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <Command
        ref={ref}
        className="rounded-lg border shadow-md md:min-w-[450px]"
        onKeyDown={(e) => {
          onKeyDown(e)
        }}
      >
        <CommandInput
          placeholder="Type a command or search..."
          autoFocus
          value={inputValue}
          onValueChange={(value) => {
            setInputValue(value)
          }}
        />
        <CommandList ref={listRef}>
          <CommandEmpty>No results found.</CommandEmpty>

          {activePage === 'home' && (
            <>
              <CommandGroup heading="Actions">
                <CommandItem onSelect={() => {
                  openPRInGithub()
                  setIsOpen(false)
                }}>
                  <MarkGithubIcon className="mr-2 h-4 w-4" />
                  <span>Open pull request in Github</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>O</Kbd>
                    <Kbd>G</Kbd>
                  </div>
                </CommandItem>
                <CommandItem onSelect={() => {
                  navigator.clipboard.writeText(pr?.repository?.pullRequest?.headRef?.name ?? '')
                  setIsOpen(false)
                }}>
                  <Copy className="mr-2 h-4 w-4" />
                  <span>Copy branch name</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>C</Kbd>
                    <Kbd>N</Kbd>
                  </div>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Filter Options">
                <CommandItem
                  onSelect={() => {
                    setPages([...pages, 'authors'])
                    bounce()
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Filter by Author</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>U</Kbd>
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPages([...pages, 'states'])
                    bounce()
                  }}
                >
                  <ListFilterIcon className="mr-2 h-4 w-4" />
                  <span>Filter by State</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>S</Kbd>
                    <Kbd>T</Kbd>
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPages([...pages, 'sort'])
                    bounce()
                  }}
                >
                  <ListFilterIcon className="mr-2 h-4 w-4" />
                  <span>Sort by</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>S</Kbd>
                    <Kbd>B</Kbd>
                  </div>
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {activePage === 'authors' && (
            <AuthorsPage
              owner={owner}
              repo={repo}
              selectedAuthor={searchParams.author || ''}
              onSelect={(author) => {
                onSearchChange('author', author)
                popPage()
                setIsOpen(false)
              }}
            />
          )}

          {activePage === 'states' && (
            <StatesPage
              selectedState={searchParams.state || ''}
              onSelect={(state) => {
                onSearchChange('state', state)
                popPage()
                setIsOpen(false)
              }}
            />
          )}

          {activePage === 'sort' && (
            <SortPage
              selectedSort={searchParams.sort || ''}
              onSelect={(sort) => {
                onSearchChange('sort', sort)
                popPage()
                setIsOpen(false)
              }}
            />
          )}
        </CommandList>
      </Command>
    </div>
  ), document.body)
}

type AuthorsPageProps = {
  owner: string
  repo: string
  selectedAuthor: string
  onSelect: (author: string) => void
}

function AuthorsPage({ owner, repo, selectedAuthor, onSelect }: AuthorsPageProps) {
  const { data } = useRepoCollaborators(owner, repo)

  return (
    <CommandGroup heading="Authors">
      {data?.repository?.collaborators?.nodes?.map((member) => (
        <CommandItem
          key={member?.login}
          value={member?.login}
          onSelect={(currentValue) => {
            onSelect(currentValue === selectedAuthor ? "" : currentValue)
          }}
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <Avatar className="mr-2 h-6 w-6">
            <AvatarImage src={member?.avatarUrl} />
          </Avatar>
          {member?.name}
          <Check
            className={cn(
              "ml-auto h-4 w-4",
              selectedAuthor === member?.login ? "opacity-100" : "opacity-0"
            )}
          />
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

type StatesPageProps = {
  selectedState: string
  onSelect: (state: string) => void
}

function StatesPage({ selectedState, onSelect }: StatesPageProps) {
  return (
    <CommandGroup heading="States">
      {stateOptions.map((option) => (
        <CommandItem
          key={option.value}
          value={option.value}
          onSelect={(currentValue) => {
            onSelect(currentValue === selectedState ? "" : currentValue)
          }}
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {option.label}
          <Check
            className={cn(
              "ml-auto h-4 w-4",
              selectedState === option.value ? "opacity-100" : "opacity-0"
            )}
          />
        </CommandItem>
      ))}
    </CommandGroup>
  )
}

type SortPageProps = {
  selectedSort: string
  onSelect: (sort: string) => void
}

function SortPage({ selectedSort, onSelect }: SortPageProps) {
  return (
    <CommandGroup heading="Sort Options">
      {sortOptions.map((option) => (
        <CommandItem
          key={option.value}
          value={option.value}
          onSelect={(currentValue) => {
            onSelect(currentValue === selectedSort ? "" : currentValue)
          }}
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          {option.label}
          <Check
            className={cn(
              "ml-auto h-4 w-4",
              selectedSort === option.value ? "opacity-100" : "opacity-0"
            )}
          />
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
