import { runQuery } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'


const membersQuery = `
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
    queryFn: () => runQuery([membersQuery, { owner }]),
  })
}
