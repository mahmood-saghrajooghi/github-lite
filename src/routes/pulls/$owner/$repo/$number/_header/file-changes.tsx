import { createFileRoute, useParams } from '@tanstack/react-router'
import { Hunk, parseDiff, Diff as DiffView, tokenize } from 'react-diff-view'
import { FileIcon } from '@primer/octicons-react'
import { usePRDiffQuery } from '@/hooks/api/use-pr-diff-query'
import { usePRQuery } from '@/hooks/api/use-pr-query'
import { useMemo, useState, useCallback } from 'react'
import refractor from 'refractor'
import type { ChangeData, DiffProps, EventMap } from 'react-diff-view'
import type { PullRequest } from '@octokit/graphql-schema'

import 'prism-color-variables/variables.css'
import './github-token-colors.css'

export const Route = createFileRoute(
  '/pulls/$owner/$repo/$number/_header/file-changes',
)({
  component: RouteComponent,
})

const renderToken: NonNullable<DiffProps['renderToken']> = (token, defaultRender, i) => {
  switch (token.type) {
    case 'space':
      console.log(token)
      return (
        <span key={i} className="space">
          {token.children &&
            token.children.map((token, i) =>
              renderToken(token, defaultRender, i),
            )}
        </span>
      )
    default:
      return defaultRender(token, i)
  }
}

type FileProps= {
  oldRevision: string
  newRevision: string
  type: DiffProps['diffType']
  hunks: DiffProps['hunks']
  oldPath: string
  newPath: string
}

function File({
  oldRevision,
  newRevision,
  type,
  hunks,
  oldPath,
  newPath,
}: FileProps) {
  const tokens = useMemo(
    () => tokenize(hunks, { highlight: true, language: 'tsx', refractor }),
    [hunks],
  )
  const [selectedChanges, setSelectedChanges] = useState<(ChangeData | null)[]>([]);
  const selectChange = useCallback<NonNullable<EventMap['onClick']>>(
    ({ change }) => {
      setSelectedChanges((selectedChanges) => {
        const index = selectedChanges.indexOf(change);
        if (index >= 0) {
          return [
            ...selectedChanges.slice(0, index),
            ...selectedChanges.slice(index + 1),
          ];
        }
        return [...selectedChanges, change];
      });
    },
    []
  );
  const diffProps = useMemo(
    () => {
      return {
        gutterEvents: { onClick: selectChange },
        codeEvents: { onClick: selectChange },
      };
    },
    [selectChange]
  );


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
        {...diffProps}
      >
        {(hunks) =>
          hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
        }
      </DiffView>
    </div>
  )
}

function Diff({ data }: { data: PullRequest }) {
  const { data: diff } = usePRDiffQuery(data.repository!.owner.login, data.repository!.name, data.number)

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
  const { data } = usePRQuery(owner, repo, Number(number))

  if (!data) {
    return null
  }

  return (
    <div>
      <Diff data={data.repository.pullRequest as PullRequest} />
    </div>
  )
}
