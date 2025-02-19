import { github } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

async function fetchUser() {
  try {
    const res = await github.users.getAuthenticated()

    const { data } = res
    return data
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
