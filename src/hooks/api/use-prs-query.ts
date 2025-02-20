import { github } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

function getQueryKey(owner: string, repo: string, params?: { author?: string, state?: string, sort?: string }) {
  let key = `pull-requests-${owner}-${repo}`
  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      if (value) {
        key += `?${paramKey}=${value}`
      }
    })
  }
  return key
}

async function fetchRepoPullRequests(owner: string, repo: string, search?: { author?: string, state?: string, sort?: string }) {
  try {
    let query = `is:pr repo:${owner}/${repo}`

    if (search?.author) {
      query += ` author:${search.author}`
    }

    if (search?.state) {
      if (search.state === 'open') {
        query += ` is:open`
      } else if (search.state === 'closed') {
        query += ` is:closed`
      } else if (search.state === 'merged') {
        query += ` is:merged`
      } else if (search.state === 'draft') {
        query += ` draft:true is:open`
      }
    }

    function getSort(sort: string) {
      if (sort === 'created-desc') {
        return { sort: 'created', order: 'desc' } as const
      }
      if (sort === 'created-asc') {
        return { sort: 'created', order: 'asc' } as const
      }
      if (sort === 'comments-desc') {
        return { sort: 'comments', order: 'desc' } as const
      }
      if (sort === 'comments-asc') {
        return { sort: 'comments', order: 'asc' } as const
      }
      if (sort === 'updated-desc') {
        return { sort: 'updated', order: 'desc' } as const
      }
      if (sort === 'updated-asc') {
        return { sort: 'updated', order: 'asc' } as const
      }

      return { sort: 'updated', order: 'desc' } as const
    }

    const res = await github.search.issuesAndPullRequests({
      q: query,
      per_page: 200,
      ...getSort(search?.sort),
    })

    const { data } = res
    return data
  } catch (err) {
    console.log(err)
  }
}


export function usePRsQuery(owner: string, repo: string, search?: { author?: string, state?: string, sort?: string }) {
  return useQuery({
    queryKey: [getQueryKey(owner, repo, search)],
    queryFn: () => fetchRepoPullRequests(owner, repo, search),
  })
}
