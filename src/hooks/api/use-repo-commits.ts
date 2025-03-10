import { runQuery } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'
import { useRepoDefaultBranch } from './use-repo-default-branch'
import type { RepoCommitsQuery } from '@/generated/graphql'

const repoCommitsQuery = /* GraphQL */ `
  query repoCommits($owner: String!, $name: String!, $branchName: String!) {
    repository(owner: $owner, name: $name) {
      ref(qualifiedName: $branchName) {
        target {
          ... on Commit {
            history(first: 4) {
              nodes {
                id
                messageHeadline
                committedDate
                oid
                associatedPullRequests(first: 1) {
                  nodes {
                    number
                  }
                }
                author {
                  name
                  avatarUrl
                  user {
                    login
                  }
                }
                url
              }
            }
          }
        }
      }
    }
  }
`

export function useRepoCommits(owner: string, repo: string, branchName?: string) {
  const defaultBranchQuery = useRepoDefaultBranch(owner, repo);
  const defaultBranchName = defaultBranchQuery.data?.repository.defaultBranchRef?.name || 'main';

  // Use provided branchName or fall back to default branch
  const branch = branchName || defaultBranchName;

  return useQuery<RepoCommitsQuery>({
    queryKey: ['repo-commits', owner, repo, branch],
    queryFn: () => runQuery<RepoCommitsQuery>([repoCommitsQuery, { owner, name: repo, branchName: branch }]),
    // Only run this query when we have the default branch info (if no branchName was provided)
    enabled: !!branchName || defaultBranchQuery.isSuccess,
    refetchInterval: 1000 * 10,
  })
}
