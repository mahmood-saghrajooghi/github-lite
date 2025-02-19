import { github } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

async function fetchIssues() {
  try {
    const res = await github.search.issuesAndPullRequests({
      q: 'is:pr is:open author:@me',
      per_page: 10,
      sort: 'updated',
      order: 'desc',
    })

    const { data } = res
    return data
  } catch (err) {
    console.log(err)
  }
}

export function useMyPRs() {
  return useQuery({
    queryKey: ['my-pull-requests'],
    queryFn: fetchIssues,
  })
}
