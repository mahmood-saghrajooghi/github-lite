import {
  createFileRoute,
  Outlet,
  useParams,
  Link,
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

export const Route = createFileRoute('/pulls/$owner/$repo/$number/_header')({
  component: RouteComponent,
})

function RouteComponent() {
  const { owner, repo, number } = useParams({ from: Route.id })

  return (
    <>
      <AppHeader>
        <Breadcrumb>
          <BreadcrumbList className="gap-2 sm:gap-2">
            <BreadcrumbItem>{owner}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={'/pulls/$owner/$repo'} params={{ owner, repo }}>
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
            to="/pulls/$owner/$repo/$number/conversation"
            params={{ owner, repo, number }}
          >
            <TabLinkIcon>
              <CommentDiscussionIcon className="!w-3.5 !h-3.5 " />
            </TabLinkIcon>
            Conversation
          </TabLink>
          <TabLink
            to="/pulls/$owner/$repo/$number/file-changes"
            params={{ owner, repo, number }}
          >
            <TabLinkIcon>
              <FileDiffIcon className="!w-3.5 !h-3.5" />
            </TabLinkIcon>
            Files changed
          </TabLink>
        </div>
      </AppHeader>
      <Outlet />
    </>
  )
}
