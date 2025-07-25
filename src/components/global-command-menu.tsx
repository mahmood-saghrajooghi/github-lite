import { createPortal } from 'react-dom'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Home,
  GitPullRequest,
} from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { MarkGithubIcon } from '@primer/octicons-react'
import { useUserRepositories } from '@/hooks/api/use-user-repos'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import isHotkey from 'is-hotkey'
import { Kbd } from './ui/kbd'
import { BoxIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function GlobalCommandMenu() {
  const ref = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const routerState = useRouterState()
  const [pages, setPages] = useState<string[]>(['home'])
  const activePage = pages[pages.length - 1]
  const isHome = activePage === 'home'

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

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isHotkey('mod+k', e)) {
        e.preventDefault()
        setIsOpen((isOpen) => !isOpen)
      }
    }

    window.addEventListener('keydown', handleKeyDown, { signal })

    return () => {
      controller.abort()
    }
  }, [])

  const goHome = useCallback(() => {
    navigate({ to: '/' })
    setIsOpen(false)
  }, [navigate])

  const goToMyPRs = useCallback(() => {
    navigate({ to: '/my-prs' })
    setIsOpen(false)
  }, [navigate])

  // Don't show global command menu on PR pages (they have their own)
  const isPRPage = routerState.location.pathname.includes('/pulls/')
  
  if (isPRPage || !isOpen) {
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
              <CommandGroup heading="Navigation">
                <CommandItem onSelect={goHome}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Go to Home</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>H</Kbd>
                  </div>
                </CommandItem>
                <CommandItem onSelect={goToMyPRs}>
                  <GitPullRequest className="mr-2 h-4 w-4" />
                  <span>My Pull Requests</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>G</Kbd>
                    <Kbd>P</Kbd>
                  </div>
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setPages([...pages, 'repositories'])
                    bounce()
                  }}
                >
                  <MarkGithubIcon className="mr-2 h-4 w-4" />
                  <span>Switch repository</span>
                  <div className="ml-auto flex gap-1">
                    <Kbd>S</Kbd>
                    <Kbd>R</Kbd>
                  </div>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {activePage === 'repositories' && (
            <RepositoriesPage
              onSelect={(owner, repo) => {
                navigate({ to: '/$owner/$repo', params: { owner, repo } })
                resetPages()
                setIsOpen(false)
              }}
            />
          )}
        </CommandList>
      </Command>
    </div>
  ), document.body)
}

type RepositoriesPageProps = {
  onSelect: (owner: string, repo: string) => void
}

function RepositoriesPage({ onSelect }: RepositoriesPageProps) {
  const { data: reposData, isLoading } = useUserRepositories()

  if (isLoading) {
    return (
      <CommandGroup heading="Repositories">
        <CommandItem disabled>
          <BoxIcon className="mr-2 h-4 w-4" />
          <span>Loading repositories...</span>
        </CommandItem>
      </CommandGroup>
    )
  }

  return (
    <CommandGroup heading="Repositories">
      {reposData?.viewer.repositories.nodes.map((repo) => (
        <CommandItem
          key={repo.id}
          value={repo.name}
          onSelect={() => {
            onSelect(repo.owner.login, repo.name)
          }}
          className="overflow-hidden text-ellipsis whitespace-nowrap"
        >
          <BoxIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="truncate">{repo.name}</span>
          {repo.isPrivate && (
            <Badge variant="outline" className="ml-2 text-xs">Private</Badge>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  )
}
