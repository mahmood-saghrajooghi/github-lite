import { Commit } from '@octokit/graphql-schema';
import { Link } from '@tanstack/react-router';

export function CommitLink({ commit }: { commit: Commit }) {
  return <Link target="_blank" to={commit.url} className="text-sm hover:underline"><code>{commit.abbreviatedOid}</code></Link>;
}
