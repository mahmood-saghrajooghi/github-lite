import { runQuery } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'
import { RepoCollaboratorsQuery } from '@/generated/graphql'

const repoCollaboratorsQuery = /* GraphQL */ `
  query repoCollaborators($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      collaborators(first: 100) {
        nodes {
          login
          avatarUrl
          name
        }
      }
    }
  }
`

export function useRepoCollaborators(owner: string, repo: string) {
  return useQuery<RepoCollaboratorsQuery>({
    queryKey: ['repo-collaborators', owner, repo],
    queryFn: () => runQuery<RepoCollaboratorsQuery>([repoCollaboratorsQuery, { owner, name: repo }]),
  })
}
