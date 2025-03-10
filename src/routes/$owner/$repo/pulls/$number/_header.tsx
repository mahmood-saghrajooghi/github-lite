import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
} from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from '@/components/ui/breadcrumb'
import { CommentDiscussionIcon, FileDiffIcon } from '@primer/octicons-react'
import { AppHeader } from '@/components/app-header'
import { TabLink, TabLinkIcon } from '@/components/tab-link'
import { Link } from '@/components/link'
import { PullRequestCommands } from '@/components/pull-request-commands'
import { useCallback } from 'react'
import { useRegisterHotkey } from '@/contexts/hotkey-context'

export const Route = createFileRoute('/$owner/$repo/pulls/$number/_header')({
  component: RouteComponent,
})

function RouteComponent() {
  const { owner, repo, number } = useParams({ from: Route.id })
  const navigate = useNavigate()

  const goToConversation = useCallback(() => {
    navigate({
      to: '/$owner/$repo/pulls/$number/conversation',
      params: { owner, repo, number },
    })
  }, [navigate, number, owner, repo])

  useRegisterHotkey('g c', goToConversation)

  const goToFileChanges = useCallback(() => {
    navigate({
      to: '/$owner/$repo/pulls/$number/file-changes',
      params: { owner, repo, number },
    })
  }, [navigate, number, owner, repo])

  useRegisterHotkey('g f', goToFileChanges)

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem>{owner}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={'/$owner/$repo'} params={{ owner, repo }}>
                  {repo}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>#{number}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-2">
          <TabLink
            to="/$owner/$repo/pulls/$number/conversation"
            params={{ owner, repo, number }}
            search={{}}
          >
            <TabLinkIcon>
              <CommentDiscussionIcon className="!w-3.5 !h-3.5 " />
            </TabLinkIcon>
            Conversation
          </TabLink>

          <TabLink
            to="/$owner/$repo/pulls/$number/file-changes"
            params={{ owner, repo, number }}
          >
            <TabLinkIcon>
              <FileDiffIcon className="!w-3.5 !h-3.5" />
            </TabLinkIcon>
            Files changed
          </TabLink>
        </div>
        <PullRequestCommands owner={owner} repo={repo} number={number} />
      </AppHeader>
      <Outlet />
    </>
  )
}
