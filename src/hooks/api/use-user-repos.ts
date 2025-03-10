import { runQuery } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

type UserRepositoriesData = {
  viewer: {
    repositories: {
      nodes: Array<{
        id: string
        name: string
        owner: {
          login: string
        }
        isPrivate: boolean
        updatedAt: string
      }>
    }
  }
}

const userRepositoriesQuery = /* GraphQL */ `
  query userRepositories {
    viewer {
      repositories(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          id
          name
          owner {
            login
          }
          isPrivate
          updatedAt
        }
      }
    }
  }
`

export function useUserRepositories() {
  return useQuery<UserRepositoriesData>({
    queryKey: ['user-repositories'],
    queryFn: () => runQuery<UserRepositoriesData>([userRepositoriesQuery, {}]),
  })
}
