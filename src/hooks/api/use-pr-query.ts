import { useQuery } from '@tanstack/react-query'
import { Repository } from '@octokit/graphql-schema'
import { runQuery } from '@/lib/client'
import { issueTimelineQuery } from '@/app/issue-timeline.query'

export function getQueryKey(owner: string, repo: string, number: number) {
  return [issueTimelineQuery, { owner, repo, number: Number(number) }]
}

export function usePRQuery(owner: string, repo: string, number: number) {
  return useQuery<{ repository: Repository }>({
    queryKey: getQueryKey(owner, repo, number),
    queryFn: () => runQuery([issueTimelineQuery, { owner, repo, number: Number(number) }]),
  })
}
