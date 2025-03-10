import * as React from "react"
import { MarkGithubIcon, GitPullRequestIcon, RepoIcon } from "@primer/octicons-react"
import { Link } from "@tanstack/react-router"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { useUserRepositories } from "@/hooks/api/use-user-repos"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { BoxIcon, HomeIcon } from 'lucide-react'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: reposData, isLoading } = useUserRepositories()

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="text-xs">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MarkGithubIcon className="size-5" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Github lite</span>
                  <span className="truncate text-xs">v0.0.1</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuButton asChild>
              <Link to="/">
                <HomeIcon width={16} />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton asChild>
              <Link to="/my-prs">
                <GitPullRequestIcon className="size-4" />
                <span>My Pull Requests</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>

          <SidebarGroupLabel>Repositories</SidebarGroupLabel>
          {isLoading ? (
            <>
              <Skeleton className="mb-2 h-7 w-full" />
              <Skeleton className="mb-2 h-7 w-full" />
              <Skeleton className="mb-2 h-7 w-full" />
              <Skeleton className="mb-2 h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </>
          ) : (
            <SidebarMenu>
              {reposData?.viewer.repositories.nodes.map((repo) => (
                <SidebarMenuButton key={repo.id} asChild size="sm" className="group/repo">
                  <Link to="/$owner/$repo" params={{ owner: repo.owner.login, repo: repo.name }}>
                    <BoxIcon width={16} className="text-muted-foreground group-hover/repo:text-foreground" />
                    <span className="truncate">{repo.name}</span>
                    {repo.isPrivate && (
                      <Badge variant="outline" className="ml-2 text-xs">Private</Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          )}

        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
