import { createFileRoute, useParams } from '@tanstack/react-router'
import { Hunk, parseDiff, Diff as DiffView, tokenize, getChangeKey } from 'react-diff-view';
import type { DiffProps, ChangeData } from 'react-diff-view'
import { FileIcon } from '@primer/octicons-react'
import { ChevronDownIcon } from 'lucide-react'
import { usePRDiffQuery } from '@/hooks/api/use-pr-diff-query'
import { usePRQuery } from '@/hooks/api/use-pr-query'
import { useMemo, useState } from 'react'
import refractor from 'refractor'
import type { IssueTimelineQuery, PullRequest, PullRequestReviewComment, PullRequestReviewThread } from '@/generated/graphql'
import { CommentForm } from '@/app/CommentForm'
import { useMutation } from '@tanstack/react-query'
import { github } from '@/lib/client'
import { getThreadsByIdMap } from '@/lib/pull-request';
import { useSelection } from '@/hooks/diff-viewer/use-selection';
import { Command, CommandEmpty, CommandInput } from '@/components/ui/command'
import { CommandItem as CommandItemPrimitive, CommandList, CommandList as CommandListPrimitive } from 'cmdk'

import 'react-diff-view/style/index.css';
import 'prism-color-variables/variables.css'
import './github-token-colors.css'
import { Button, ButtonIcon } from '@/components/ui/button'
import { PullRequestThread } from '@/app/timeline/components/pull-request-thread/pull-request-thread';

export const Route = createFileRoute(
  '/pulls/$owner/$repo/$number/_header/file-changes',
)({
  component: RouteComponent,
})

function getChangeId(change: ChangeData, side: 'new' | 'old') {
  return `${change.content}-${change.lineNumber}-${side}`;
}

const renderToken: NonNullable<DiffProps['renderToken']> = (token, defaultRender, i) => {
  switch (token.type) {
    case 'space':
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

type FileProps = {
  oldRevision: string
  newRevision: string
  type: DiffProps['diffType']
  hunks: DiffProps['hunks']
  oldPath: string
  newPath: string
  pullRequest: NonNullable<NonNullable<IssueTimelineQuery['repository']>['pullRequest']>
  comments: (PullRequestReviewComment & { thread: PullRequestReviewThread })[]
}

function HunkSpacer({ content }: { content: string }) {
  return (
    <tbody className="text-xs text-muted-foreground bg-muted/30 border-y border-input whitespace-nowrap">
      <tr>
        <td className="w-full">
          <div className="px-4 py-2">
            {content}
          </div>
        </td>
      </tr>
    </tbody >
  );
}

function File({
  oldRevision,
  newRevision,
  type,
  hunks,
  oldPath,
  newPath,
  pullRequest,
  comments,
}: FileProps) {
  const pullRequestId = pullRequest.id;
  const [isOpen, setIsOpen] = useState(true);
  // const [selectedChanges, toggleChangeSelection] = useChangeSelect(hunks, {
  //   multiple: true,
  // });
  const [selectedChanges, toggleChangeSelection] = useSelection(hunks, newPath);


  const tokens = useMemo(
    () => tokenize(hunks, { highlight: true, language: 'tsx', refractor }),
    [hunks],
  )

  const [isCommenting, setIsCommenting] = useState(false);

  const { mutate: createReviewThread } = useMutation({
    mutationFn: async ({ body, line }: { body: string; line: number }) => {
      return github.graphql(/* GraphQL */`
        mutation AddPullRequestReviewThread($input: AddPullRequestReviewThreadInput!) {
          addPullRequestReviewThread(input: $input) {
            thread {
              id
            }
          }
        }
      `, {
        input: {
          body,
          path: newPath,
          line,
          pullRequestId,
        }
      });
    }
  });

  const diffProps = useMemo(
    () => {
      const isSelected = (change: ChangeData | null, side: 'new' | 'old') => {
        if (!change) return false;
        if (change.type !== 'insert' && change.type !== 'delete') return false;
        const changeId = getChangeId(change, side);
        return selectedChanges.has(changeId);
      };

      // const renderGutter: DiffProps['renderGutter'] = (options) => {
      //   const selected = isSelected(options.change, options.side);
      //   return (
      //     <div
      //       className={`select-none ${selected ? 'bg-blue-100 dark:bg-blue-950' : ''}`}
      //       {...options}
      //     >
      //       {options.change?.type === 'insert' || options.change?.type === 'delete' ? options.change.lineNumber : null}
      //     </div>
      //   );
      // };

      return {
        gutterEvents: { onClick: toggleChangeSelection },
        selectedChanges,
        // renderGutter,
      };
    },
    [toggleChangeSelection, selectedChanges]
  );

  const widgets = useMemo(
    () => comments.reduce<Record<string, React.ReactElement[]>>(
      (widgets, comment) => {
        const change = hunks.reduce((prev, hunk) => {
          const res = hunk.changes.find(change => (comment.thread?.diffSide === "RIGHT" ? change.type === "insert" : change.type === "delete") && change.lineNumber === comment.line);
          if (res) {
            return res;
          }
          return prev;
        }, null);
        if (!change) return widgets;
        const changeKey = getChangeKey(change);
        if (!widgets[changeKey]) {
          // eslint-disable-next-line no-param-reassign
          widgets[changeKey] = [];
        }
        widgets[changeKey].push(
          <div className="p-2 border-b border border-input">
            <PullRequestThread key={comment.thread.id} data={comment.thread} />
          </div>
        );

        return widgets;
      },
      {} as Record<string, React.ReactElement[]>
    ),
    [comments]
  );

  return (
    <div className="border border-input rounded-lg">
      <div className="grid grid-cols-[1fr_1fr] gap-2 pl-8 pr-4 py-2 relative">
        {oldPath === newPath ? (
          <div className="flex items-center gap-2">
            <FileIcon className="!w-3.5 !h-3.5 text-muted-foreground" />
            {oldPath}
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <FileIcon className="!w-3.5 !h-3.5 text-muted-foreground" />
              {oldPath}
            </div>
            <div className="flex gap-2">
              <FileIcon className="!w-3.5 !h-3.5 text-muted-foreground" />
              {newPath}
            </div>
          </>
        )}
        <Button
          variant="ghost"
          className="w-6 h-6 !px-0 !py-0 absolute left-1 top-1/2 -translate-y-1/2"
          onClick={() => setIsOpen(_isOpen => !_isOpen)}
        >
          <ChevronDownIcon className={`w-3.5 h-3.5 text-muted-foreground ${!isOpen ? '-rotate-90' : ''}`} />
        </Button>
      </div>
      {
        isOpen && (
          <>
            {isCommenting && selectedChanges.size > 0 && (
              <div className="p-4 border-b border-input">
                <CommentForm
                  onSubmit={async (body) => {
                    const sortedChanges = selectedChanges.toArray();
                    const lastChangeId = sortedChanges[sortedChanges.length - 1];
                    const line = parseInt(lastChangeId.split('-')[1], 10);

                    await createReviewThread({
                      body,
                      line,
                    });
                    setSelectedChanges(new SortedSet());
                    setIsCommenting(false);
                  }}
                />
              </div>
            )}
            <DiffView
              key={oldRevision + '-' + newRevision}
              viewType="split"
              diffType={type}
              hunks={hunks}
              renderToken={renderToken}
              tokens={tokens}
              widgets={widgets}
              codeClassName="border-r border-input"
              {...diffProps}
            >
              {(hunks) => hunks.map((hunk, index) => (
                <>
                  <HunkSpacer
                    key={`spacer-${index}`}
                    content={hunk.content}
                  />
                  <Hunk key={hunk.content} hunk={hunk} />
                </>
              ))}
            </DiffView>

          </>
        )
      }
    </div>
  )
}

function Diff({ data }: { data: PullRequest }) {
  const { data: diff } = usePRDiffQuery(data.repository!.owner.login, data.repository!.name, data.number)

  const threadsById = useMemo(() => getThreadsByIdMap(data), [data.reviewThreads.nodes]);

  const comments = useMemo(() => {
    const commentsByFilePath = new Map<string, (PullRequestReviewComment & { thread: PullRequestReviewThread })[]>();
    if (!data.reviewThreads.nodes) return commentsByFilePath;
    for (const reviewThread of data.reviewThreads.nodes) {
      if (!reviewThread?.comments.nodes) continue;
      for (const comment of reviewThread.comments.nodes) {
        if (!comment) continue;
        const thread = threadsById.get(comment?.id ?? '');
        const newComment = {
          ...comment,
          thread,
        } as PullRequestReviewComment & { thread: PullRequestReviewThread };
        commentsByFilePath.set(comment.path, [...(commentsByFilePath.get(comment.path) ?? []), newComment]);
      }
    }
    return commentsByFilePath;
  }, [data.reviewThreads.nodes, threadsById]);

  if (!diff) {
    return null
  }

  const files = parseDiff(diff)

  return (
    <div className="text-xs font-mono p-2 flex flex-col gap-2">
      {files.map((file, index) => (
        <File key={index} {...file} pullRequest={data} comments={comments.get(file.newPath) ?? []} />
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
      <Diff data={data.repository?.pullRequest as PullRequest} />
    </div>
  )
}
