import { runQuery } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'
import { MembersQuery } from '@/generated/graphql'

const membersQuery = /* GraphQL */ `
  query members($owner: String!) {
    organization(login: $owner) {
      membersWithRole(first: 100) {
        nodes {
          login
          avatarUrl
          name
        }
      }
    }
  }
`
export function useRepoMembers(owner: string) {
  return useQuery({
    queryKey: ['repo-members', owner],
    queryFn: () => runQuery<MembersQuery>([membersQuery, { owner }]),
  })
}
