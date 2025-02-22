import { graphql as githubGraphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';
import { queryClient } from '@/query-client';

const CLIENT_ID = 'Iv23liKSgTuckq1LavWJ';

export const github = new Octokit({
  auth: localStorage.token
});

export const graphql = githubGraphql.defaults({
  headers: {
    authorization: `token ${localStorage.token}`,
    'If-None-Match': '',
    'X-Github-Next-Global-ID': '1'
  },
});

export async function runQuery<T>([query, options]: [string, Record<string, unknown>]): Promise<T> {
  return graphql(query, options);
}

export function preload(query: string, options: Record<string, unknown>) {
  queryClient.prefetchQuery({ queryKey: [query, options], queryFn: () => runQuery([query, options]) });
}

export async function login() {
  const url = new URL(location.href);
  const code = url.searchParams.get('code');
  if (!code) {
    const redirect = new URL('https://github.com/login/oauth/authorize');
    redirect.searchParams.set('client_id', CLIENT_ID);
    redirect.searchParams.set('scope', 'repo notifications read:user');
    if (process.env.NODE_ENV !== 'production') {
      redirect.searchParams.set('redirect_uri', `http://localhost:3000/login?redirect=${location.href}`);
    }
    location.replace(redirect);
    return;
  }

  try {
    const res = await fetch('https://github-lite.pages.dev/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({code})
    });

    const json = await res.json();
    if (json.error) {
      console.log(json);
      return;
    }

    localStorage.token = json.token;

    url.searchParams.delete('code');
    location.replace(url)
  } catch (err) {
    console.log(err);
    // location.reload();
  }
}
