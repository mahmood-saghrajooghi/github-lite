import { github } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

  function getQueryKey(owner: string, repo: string, params: { author?: string }) {
    let key = `pull-requests-${owner}-${repo}`
    Object.entries(params).forEach(([paramKey, value]) => {
      if (value) {
        key += `?${paramKey}=${value}`
      }
    })
    return key
  }

async function fetchRepoPullRequests(owner: string, repo: string, search: any) {
  try {
    let query = `is:pr is:open repo:${owner}/${repo}`

    if (search.author) {
      query += ` author:${search.author}`
    }

    const res = await github.search.issuesAndPullRequests({
      q: query,
      per_page: 200,
      sort: 'updated',
      order: 'desc',
    })

    const { data } = res
    return data
  } catch (err) {
    console.log(err)
  }
}


export function usePRsQuery(owner: string, repo: string, search: any) {
  return useQuery({
    queryKey: [getQueryKey(owner, repo, search)],
    queryFn: () => fetchRepoPullRequests(owner, repo, search),
  })
}
