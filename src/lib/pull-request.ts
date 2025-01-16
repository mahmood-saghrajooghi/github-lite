import { RestEndpointMethodTypes } from '@octokit/rest';

type PullRequest = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["response"]["data"]["items"][0];

export function getPrURL(item: PullRequest) {
  const repoURL = item.repository_url;
  const [owner, repo] = repoURL.split('/').slice(-2);
  const number = item.pull_request?.url?.split('/').pop();
  return `/pulls/${owner}/${repo}/${number}/conversation`;
}
