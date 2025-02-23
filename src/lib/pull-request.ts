export function getPrURL(item: { repository_url: string, pull_request: { url: string } }) {
  const repoURL = item.repository_url;
  const [owner, repo] = repoURL.split('/').slice(-2);
  const number = item.pull_request?.url?.split('/').pop();
  return `/pulls/${owner}/${repo}/${number}/conversation`;
}
