import { useState, useMemo } from 'react'
import { BoxIcon, LockIcon, SearchIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUserRepositories } from '@/hooks/api/use-user-repos'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'

export function RepositoryBrowser() {
  const { data: reposData, isLoading, error } = useUserRepositories()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRepos = useMemo(() => {
    if (!reposData?.viewer.repositories.nodes) return []
    
    return reposData.viewer.repositories.nodes.filter((repo) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.owner.login.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [reposData?.viewer.repositories.nodes, searchQuery])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            className="pl-10"
            disabled
          />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-16" />
              </div>
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load repositories</p>
      </div>
    )
  }

  if (!reposData?.viewer.repositories.nodes.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No repositories found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredRepos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No repositories match your search</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRepos.map((repo) => (
            <div
              key={repo.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <BoxIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{repo.name}</span>
                    {repo.isPrivate && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        <LockIcon className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{repo.owner.login}</span>
                    <span>Updated {formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <Button asChild size="sm" className="flex-shrink-0 ml-4">
                <Link to="/$owner/$repo" params={{ owner: repo.owner.login, repo: repo.name }}>
                  View
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}