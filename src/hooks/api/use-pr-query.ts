import { useQuery } from '@tanstack/react-query'
import { PullRequestPage } from '@/app/PullRequest'
import { Repository } from '@octokit/graphql-schema'
import { runQuery } from '@/lib/client'

export function getQueryKey(owner: string, repo: string, number: number) {
  return [PullRequestPage.query(), { owner, repo, number: Number(number) }]
}

export function usePRQuery(owner: string, repo: string, number: number) {
  return useQuery<{ repository: Repository }>({
    queryKey: getQueryKey(owner, repo, number),
    queryFn: () => runQuery([PullRequestPage.query(), { owner, repo, number: Number(number) }]),
  })
}
