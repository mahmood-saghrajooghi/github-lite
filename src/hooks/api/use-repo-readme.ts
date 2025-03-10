import { runQuery } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

// Define the typed response from the GraphQL query
interface RepoReadmeQuery {
  repository: {
    object: {
      text: string
    } | null
  }
}

const repoReadmeQuery = /* GraphQL */ `
  query repoReadme($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      object(expression: "master:readme.md") {
        ... on Blob {
          text
        }
      }
    }
  }
`

export function useRepoReadme(owner: string, repo: string) {
  return useQuery<RepoReadmeQuery>({
    queryKey: ['repo-readme', owner, repo],
    queryFn: () => runQuery<RepoReadmeQuery>([repoReadmeQuery, { owner, name: repo }]),
  })
}
