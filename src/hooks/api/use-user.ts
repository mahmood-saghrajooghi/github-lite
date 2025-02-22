import { graphql } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'
import { User } from '@octokit/graphql-schema'

const GET_USER = `
  query getAuthenticatedUser {
    viewer {
      login
      name
      email
      avatarUrl
    }
  }
`;

async function fetchUser() {
  try {
    const res2 = await graphql(GET_USER) as { viewer: User }

    return res2.viewer
  } catch (err) {
    console.log(err)
  }
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  })
}
