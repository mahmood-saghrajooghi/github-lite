import { Repository } from '@octokit/graphql-schema'
import { createFileRoute, useParams } from '@tanstack/react-router'
import { github, useQuery } from '@/lib/client'
import { PullRequestPage } from '@/app/PullRequest'
import { Hunk, parseDiff, Diff as DiffView, tokenize } from 'react-diff-view'
import useSWR from 'swr'
import { RestEndpointMethodTypes } from '@octokit/rest'
import { FileIcon } from '@primer/octicons-react'
import { useMemo } from 'react'
import refractor from 'refractor'

import 'prism-color-variables/variables.css'
import './github-token-colors.css'

type PullRequest =
  RestEndpointMethodTypes['search']['issuesAndPullRequests']['response']['data']['items'][0]

export const Route = createFileRoute(
  '/pulls/$owner/$repo/$number/_header/file-changes',
)({
  component: RouteComponent,
})

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

const renderToken = (token: any, defaultRender: any, i: any) => {
  switch (token.type) {
    case 'space':
      console.log(token)
      return (
        <span key={i} className="space">
          {token.children &&
            token.children.map((token: any, i: any) =>
              renderToken(token, defaultRender, i),
            )}
        </span>
      )
    default:
      return defaultRender(token, i)
  }
}

function File({
  oldRevision,
  newRevision,
  type,
  hunks,
  oldPath,
  newPath,
}: any) {
  const tokens = useMemo(
    () => tokenize(hunks, { highlight: true, language: 'tsx', refractor }),
    [hunks],
  )

  return (
    <div>
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        {oldPath === newPath ? (
          <div className="flex items-center gap-2">
            <FileIcon className="!w-3.5 !h-3.5 text-muted-foreground" />
            {oldPath}
          </div>
        ) : (
          <>
            <div className="flex items-center px-3 py-2 gap-2">
              <FileIcon className="!w-3.5 !h-3.5 text-muted-foreground" />
              {oldPath}
            </div>
            <div className="flex items-center px-3 py-2 gap-2">
              <FileIcon className="!w-3.5 !h-3.5 text-muted-foreground" />
              {newPath}
            </div>
          </>
        )}
      </div>
      <DiffView
        key={oldRevision + '-' + newRevision}
        viewType="split"
        diffType={type}
        hunks={hunks}
        renderToken={renderToken}
        tokens={tokens}
      >
        {(hunks) =>
          hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
        }
      </DiffView>
    </div>
  )
}

function Diff({ data }: { data: PullRequest }) {
  const { data: diff } = useSWR(
    `/repos/${data.repository.owner.login}/${data.repository.name}/pulls/${data.number}/files`,
    () =>
      getDiff(data.repository.owner.login, data.repository.name, data.number),
  )

  if (!diff) {
    return null
  }

  const files = parseDiff(diff)

  return (
    <div className="text-xs font-mono">
      {files.map((file, index) => (
        <File key={index} {...file} />
      ))}
    </div>
  )
}

function RouteComponent() {
  const { owner, repo, number } = useParams({ from: Route.id })
  const { data } = useQuery<{ repository: Repository }>(
    PullRequestPage.query(),
    { owner, repo, number: Number(number) },
  )

  if (!data) {
    return null
  }

  return (
    <div>
      <Diff data={data.repository.pullRequest} />
    </div>
  )
}
