import { useQuery } from '@tanstack/react-query'
import { runQuery } from '@/lib/client'
import { issueTimelineQuery } from '@/app/issue-timeline.query'
import { IssueTimelineQuery } from '@/generated/graphql'

export function getQueryKey(owner: string, repo: string, number: number) {
  return [issueTimelineQuery, { owner, repo, number: Number(number) }]
}

export function usePRQuery(owner: string, repo: string, number: number) {
  return useQuery<IssueTimelineQuery>({
    queryKey: getQueryKey(owner, repo, number),
    queryFn: () => runQuery<IssueTimelineQuery>([issueTimelineQuery, { owner, repo, number: Number(number) }]),
  })
}
