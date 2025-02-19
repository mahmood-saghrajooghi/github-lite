import { github } from '@/lib/client'
import { useQuery } from '@tanstack/react-query'

const getDiff = async (owner: string, repo: string, number: number) => {
  const res = await github.pulls.get({
    owner,
    repo,
    pull_number: number,
    headers: {
      accept: 'application/vnd.github.v3.diff', // Request diff format
    },
  })
  return res.data
}

export function usePRDiffQuery(owner: string, repo: string, number: number) {
  return useQuery({
    queryKey: [`/repos/${owner}/${repo}/pulls/${number}/files`],
    queryFn: () => getDiff(owner, repo, number),
  })
}
