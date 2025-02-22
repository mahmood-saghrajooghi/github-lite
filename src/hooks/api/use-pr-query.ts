import { useQuery } from '@tanstack/react-query'
import { Repository } from '@octokit/graphql-schema'
import { runQuery } from '@/lib/client'
import { issueTimeline } from '@/app/issue-timeline.query.graphql'

export function getQueryKey(owner: string, repo: string, number: number) {
  return [issueTimeline, { owner, repo, number: Number(number) }]
}

export function usePRQuery(owner: string, repo: string, number: number) {
  return useQuery<{ repository: Repository }>({
    queryKey: getQueryKey(owner, repo, number),
    queryFn: () => runQuery([issueTimeline, { owner, repo, number: Number(number) }]),
  })
}
