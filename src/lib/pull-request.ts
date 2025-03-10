import { PullRequest } from '@/generated/graphql';

export function getPrURL(item: { repository_url: string, pull_request: { url: string } }) {
  const repoURL = item.repository_url;
  const [owner, repo] = repoURL.split('/').slice(-2);
  const number = item.pull_request?.url?.split('/').pop();
  return `/${owner}/${repo}/pulls/${number}/conversation`;
}

export function getThreadsByIdMap(pr: PullRequest) {
  const res = new Map();
  if (!pr?.reviewThreads.nodes) {
    return res;
  }
    for (const thread of pr.reviewThreads.nodes) {
    res.set(thread?.comments.nodes?.[0]?.id, thread);
  }
  return res;
}
