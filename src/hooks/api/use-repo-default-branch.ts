import { runQuery } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

// Define the typed response for the GraphQL query
interface RepoDefaultBranchQuery {
  repository: {
    defaultBranchRef: {
      name: string
    } | null
  }
}

const repoDefaultBranchQuery = /* GraphQL */ `
  query repoDefaultBranch($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        name
      }
    }
  }
`

export function useRepoDefaultBranch(owner: string, repo: string) {
  return useQuery<RepoDefaultBranchQuery>({
    queryKey: ['repo-default-branch', owner, repo],
    queryFn: () => runQuery<RepoDefaultBranchQuery>([repoDefaultBranchQuery, { owner, name: repo }]),
  })
}
