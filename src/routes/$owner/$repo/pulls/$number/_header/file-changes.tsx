import { createFileRoute, useParams } from '@tanstack/react-router'
import {
  Hunk,
  parseDiff,
  Diff as DiffView,
  tokenize,
  getChangeKey,
} from 'react-diff-view'
import type { DiffProps, ChangeData, GutterOptions } from 'react-diff-view'
import { FileIcon } from '@primer/octicons-react'
import { ChevronDownIcon, PlusIcon } from 'lucide-react'
import { usePRDiffQuery } from '@/hooks/api/use-pr-diff-query'
import { usePRQuery } from '@/hooks/api/use-pr-query'
import { useMemo, useState, useCallback, useEffect } from 'react'
import refractor from 'refractor'
import type {
  IssueTimelineQuery,
  PullRequest,
  PullRequestReviewComment,
  PullRequestReviewThread,
} from '@/generated/graphql'
import { CommentForm } from '@/app/CommentForm'
import { useMutation } from '@tanstack/react-query'
import { github } from '@/lib/client'
import { getThreadsByIdMap } from '@/lib/pull-request'
import { useSelection } from '@/hooks/diff-viewer/use-selection'
import { diffWorkerClient } from '@/lib/diff-worker-client'
import { useDiffMode } from '@/contexts/diff-mode-context'
import { useDifftasticDiff } from '@/hooks/api/use-difftastic-diff'
import { DifftasticDiffView } from '@/components/difftastic-diff-view'
// import { Command, CommandEmpty, CommandInput } from '@/components/ui/command'
// import { CommandItem as CommandItemPrimitive, CommandList, CommandList as CommandListPrimitive } from 'cmdk'

import 'react-diff-view/style/index.css'
import 'prism-color-variables/variables.css'
import './github-token-colors.css'
import { Button } from '@/components/ui/button'
import { PullRequestThread } from '@/app/timeline/components/pull-request-thread/pull-request-thread'
import { Card } from '@/components/ui/card'
import { Toggle } from '@/components/ui/toggle'

export const Route = createFileRoute(
  '/$owner/$repo/pulls/$number/_header/file-changes',
)({
  component: RouteComponent,
})

const CommentTrigger = ({
  onClick,
  renderDefault,
}: {
  onClick: () => void
  renderDefault: () => React.ReactNode
}) => {
  return (
    <div className="relative" onClick={() => onClick()}>
      <PlusIcon className="w-4 h-4 bg-blue-500 text-white absolute top-1/2 left-1 rounded -translate-x-1/2 -translate-y-1/2 hover:w-5 hover:h-5 duration-200 ease" />
      {renderDefault()}
    </div>
  )
}

const renderToken: NonNullable<DiffProps['renderToken']> = (
  token,
  defaultRender,
  i,
) => {
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
  pullRequest: NonNullable<
    NonNullable<IssueTimelineQuery['repository']>['pullRequest']
  >
  comments: (PullRequestReviewComment & { thread: PullRequestReviewThread })[]
  owner: string
  repo: string
}

function HunkSpacer({ content }: { content: string }) {
  return (
    <tbody className="text-xs text-muted-foreground bg-muted/30 border-y border-input whitespace-nowrap">
      <tr>
        <td className="w-full">
          <div className="px-4 py-2">{content}</div>
        </td>
      </tr>
    </tbody>
  )
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
  owner,
  repo,
}: FileProps) {
  const pullRequestId = pullRequest.id
  const [isOpen, setIsOpen] = useState(true)
  const { mode, toggleMode } = useDiffMode()
  // const [selectedChanges, toggleChangeSelection] = useChangeSelect(hunks, {
  //   multiple: true,
  // });
  const [selectedChanges, toggleChangeSelection] = useSelection(hunks, newPath)
  // Track the change that the user wants to comment on
  const [commentingChange, setCommentingChange] = useState<{
    changeKey: string
    change: ChangeData
    side: string
  } | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tokens, setTokens] = useState<any>(null)
  const [isTokenizing, setIsTokenizing] = useState(false)
  const [fileContents, setFileContents] = useState<{
    oldContent: string
    newContent: string
  } | null>(null)
  const [isFetchingContents, setIsFetchingContents] = useState(false)

  // Fetch file contents for structural diff
  useEffect(() => {
    if (mode !== 'structural') return

    const fetchFileContents = async () => {
      setIsFetchingContents(true)
      try {
        // Fetch old content (base)
        const oldContentResponse = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${oldRevision}/${oldPath}`
        )
        const oldContent = oldContentResponse.ok ? await oldContentResponse.text() : ''

        // Fetch new content (head)
        const newContentResponse = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${newRevision}/${newPath}`
        )
        const newContent = newContentResponse.ok ? await newContentResponse.text() : ''

        setFileContents({ oldContent, newContent })
      } catch (error) {
        console.error('Failed to fetch file contents:', error)
        setFileContents(null)
      } finally {
        setIsFetchingContents(false)
      }
    }

    fetchFileContents()
  }, [mode, owner, repo, oldRevision, newRevision, oldPath, newPath])

  // Difftastic diff query (only enabled in structural mode)
  const {
    data: difftasticDiff,
    isLoading: isDifftasticLoading,
    error: difftasticError,
  } = useDifftasticDiff({
    oldContent: fileContents?.oldContent || '',
    newContent: fileContents?.newContent || '',
    oldPath,
    newPath,
    enabled: mode === 'structural' && !!fileContents,
  })

  useEffect(() => {
    if (!hunks?.length) return

    setIsTokenizing(true)

    // Try to use service worker first, fallback to main thread
    const processTokens = async () => {
      try {
        // Convert hunks to diff format for worker processing
        const diffContent = hunks.map(hunk => hunk.content).join('\n')
        const result = await diffWorkerClient.processDiff(diffContent, 'tsx')

        // Extract tokens for this specific file
        const fileTokens = result.tokens[newPath]
        if (fileTokens) {
          setTokens(fileTokens)
        } else {
          // Fallback to main thread tokenization
          const fallbackTokens = tokenize(hunks, { highlight: true, language: 'tsx', refractor })
          setTokens(fallbackTokens)
        }
      } catch (error) {
        console.warn('Service worker tokenization failed, falling back to main thread:', error)
        // Fallback to main thread tokenization
        const fallbackTokens = tokenize(hunks, { highlight: true, language: 'tsx', refractor })
        setTokens(fallbackTokens)
      } finally {
        setIsTokenizing(false)
      }
    }

    processTokens()
  }, [hunks, newPath])

  const { mutate: addComment } = useMutation({
    mutationFn: async ({
      body,
      line,
      path,
      side,
    }: {
      body: string
      line: number
      path: string
      side: string
    }) => {
      await github.graphql(
        /* GraphQL */ `
          mutation CreateReview($input: AddPullRequestReviewInput!) {
            addPullRequestReview(input: $input) {
              pullRequestReview {
                id
              }
            }
          }
        `,
        {
          input: {
            pullRequestId,
            threads: [
              {
                body,
                path,
                line,
                side,
              },
            ],
          },
        },
      )
      await github.graphql(
        /* GraphQL */ `
          mutation SubmitPullRequestReview(
            $input: SubmitPullRequestReviewInput!
          ) {
            submitPullRequestReview(input: $input) {
              pullRequestReview {
                id
              }
            }
          }
        `,
        {
          input: {
            pullRequestId,
            event: 'COMMENT',
          },
        },
      )
    },
  })

  const handleCommentClick = useCallback(
    ({ change, side }: { change: ChangeData; side: string }) => {
      const changeKey = getChangeKey(change)
      setCommentingChange({ changeKey, change, side })
    },
    [],
  )

  const handleCommentSubmit = useCallback(
    async (body: string) => {
      if (!commentingChange) return

      let line: number
      if (
        commentingChange.change.type === 'insert' ||
        commentingChange.change.type === 'delete'
      ) {
        line = commentingChange.change.lineNumber
      } else {
        line = commentingChange.change.newLineNumber
      }

      // Create the review thread
      await addComment({
        body,
        line,
        path: newPath,
        side: commentingChange.side === 'new' ? 'RIGHT' : 'LEFT',
      })

      // Clear the commenting state
      setCommentingChange(null)
    },
    [commentingChange, addComment, newPath],
  )

  const renderGutter = useCallback(
    ({
      change,
      side,
      inHoverState,
      renderDefault,
      wrapInAnchor,
    }: GutterOptions) => {
      const canComment = inHoverState
      if (canComment) {
        return (
          <CommentTrigger
            onClick={() => handleCommentClick({ change, side })}
            renderDefault={renderDefault}
          />
        )
      }

      return wrapInAnchor(renderDefault())
    },
    [handleCommentClick],
  )

  const diffProps = useMemo(() => {
    return {
      gutterEvents: { onClick: toggleChangeSelection },
      selectedChanges,
      renderGutter,
    }
  }, [toggleChangeSelection, selectedChanges, renderGutter])

  const widgets = useMemo(() => {
    // Start with existing comments
    const widgetsMap = comments.reduce<Record<string, React.ReactElement[]>>(
      (widgets, comment) => {
        // Skip comments without a thread
        if (!comment.thread) return widgets

        const change = hunks.reduce(
          (prev, hunk) => {
            const res = hunk.changes.find((change) => {
              if (comment.thread?.diffSide === 'RIGHT') {
                return (
                  change.type === 'insert' && change.lineNumber === comment.line
                )
              } else {
                return (
                  change.type === 'delete' && change.lineNumber === comment.line
                )
              }
            })
            if (res) {
              return res
            }
            return prev
          },
          null as ChangeData | null,
        )

        if (!change) return widgets
        const changeKey = getChangeKey(change)
        if (!widgets[changeKey]) {
          widgets[changeKey] = []
        }
        widgets[changeKey].push(
          <div
            key={comment.thread.id}
            className="p-2 border-b border border-input"
          >
            <PullRequestThread data={comment.thread} />
          </div>,
        )

        return widgets
      },
      {} as Record<string, React.ReactElement[]>,
    )

    // Add the new comment form if we're commenting
    if (commentingChange) {
      const { changeKey } = commentingChange
      if (!widgetsMap[changeKey]) {
        widgetsMap[changeKey] = []
      }

      widgetsMap[changeKey].push(
        <div key="new-comment" className="p-2 border-b border border-input">
          <Card className="p-3 border border-input">
            <CommentForm
              onSubmit={handleCommentSubmit}
              autoFocus
              handleClose={() => setCommentingChange(null)}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCommentingChange(null)}
              >
                Cancel
              </Button>
            </CommentForm>
          </Card>
        </div>,
      )
    }

    return widgetsMap
  }, [comments, hunks, commentingChange, handleCommentSubmit])

  return (
    <div className="border border-input rounded-lg">
      <div className="flex items-center justify-between pl-8 pr-4 py-2 relative">
        <div className="flex-1 grid grid-cols-[1fr_1fr] gap-2">
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
        </div>
        <div className="flex items-center gap-2">
          <Toggle
            size="sm"
            pressed={mode === 'structural'}
            onPressedChange={toggleMode}
            aria-label="Toggle structural diff"
            className="text-xs"
          >
            {mode === 'structural' ? 'Structural' : 'Traditional'}
          </Toggle>
        </div>
        <Button
          variant="ghost"
          className="w-6 h-6 !px-0 !py-0 absolute left-1 top-1/2 -translate-y-1/2"
          onClick={() => setIsOpen((_isOpen) => !_isOpen)}
        >
          <ChevronDownIcon
            className={`w-3.5 h-3.5 text-muted-foreground ${!isOpen ? '-rotate-90' : ''}`}
          />
        </Button>
      </div>
      {isOpen && (
        <>
          {mode === 'structural' ? (
            // Structural diff view (difftastic)
            <>
              {isFetchingContents || isDifftasticLoading ? (
                <div className="p-4 text-muted-foreground text-xs">
                  {isFetchingContents
                    ? 'Fetching file contents...'
                    : 'Processing structural diff...'}
                </div>
              ) : difftasticError ? (
                <div className="p-4 text-red-500 text-xs">
                  Error: {difftasticError instanceof Error ? difftasticError.message : 'Failed to generate structural diff'}
                  <div className="mt-2">
                    <Button size="sm" variant="outline" onClick={toggleMode}>
                      Switch to traditional diff
                    </Button>
                  </div>
                </div>
              ) : difftasticDiff ? (
                <DifftasticDiffView diff={difftasticDiff} />
              ) : (
                <div className="p-4 text-muted-foreground text-xs">
                  Loading structural diff...
                </div>
              )}
            </>
          ) : (
            // Traditional diff view (react-diff-view)
            <>
              {isTokenizing ? (
                <div className="p-4 text-muted-foreground text-xs">
                  Processing syntax highlighting...
                </div>
              ) : tokens ? (
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
                  {(hunks) =>
                    hunks.map((hunk, index) => (
                      <>
                        <HunkSpacer key={`spacer-${index}`} content={hunk.content} />
                        <Hunk key={hunk.content} hunk={hunk} />
                      </>
                    ))
                  }
                </DiffView>
              ) : (
                <div className="p-4 text-muted-foreground text-xs">
                  Loading diff view...
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function Diff({
  data,
  owner,
  repo,
}: {
  data: NonNullable<
    NonNullable<IssueTimelineQuery['repository']>['pullRequest']
  >
  owner: string
  repo: string
}) {
  const { data: diff } = usePRDiffQuery(
    data.repository!.owner.login,
    data.repository!.name,
    data.number,
  )

  const [files, setFiles] = useState<ReturnType<typeof parseDiff> | null>(null)
  const [isProcessingDiff, setIsProcessingDiff] = useState(false)

  const threadsById = useMemo(
    () => getThreadsByIdMap(data as PullRequest),
    [data],
  )

  const comments = useMemo(() => {
    const commentsByFilePath = new Map<
      string,
      (PullRequestReviewComment & { thread: PullRequestReviewThread })[]
    >()
    if (!data.reviewThreads.nodes) return commentsByFilePath
    for (const reviewThread of data.reviewThreads.nodes) {
      if (!reviewThread?.comments.nodes) continue
      for (const comment of reviewThread.comments.nodes) {
        if (!comment) continue
        const thread = threadsById.get(comment?.id ?? '')
        const newComment = {
          ...comment,
          thread,
        } as PullRequestReviewComment & { thread: PullRequestReviewThread }
        commentsByFilePath.set(comment.path, [
          ...(commentsByFilePath.get(comment.path) ?? []),
          newComment,
        ])
      }
    }
    return commentsByFilePath
  }, [data.reviewThreads.nodes, threadsById])

  useEffect(() => {
    if (!diff) {
      setFiles(null)
      return
    }

    setIsProcessingDiff(true)

    // Try to use service worker first, fallback to main thread
    const processDiff = async () => {
      try {
        const result = await diffWorkerClient.processDiff(diff, 'tsx')
        setFiles(result.files)
      } catch (error) {
        console.warn('Service worker diff processing failed, falling back to main thread:', error)
        // Fallback to main thread processing
        const parsedFiles = parseDiff(diff)
        setFiles(parsedFiles)
      } finally {
        setIsProcessingDiff(false)
      }
    }

    processDiff()
  }, [diff])

  if (!diff || !files) {
    return isProcessingDiff ? (
      <div className="text-xs font-mono p-2 text-muted-foreground">
        Processing diff...
      </div>
    ) : null
  }

  return (
    <div className="text-xs font-mono p-2 flex flex-col gap-2">
      {files.map((file, index) => (
        <File
          key={index}
          {...file}
          pullRequest={data}
          comments={comments.get(file.newPath) ?? []}
          owner={owner}
          repo={repo}
        />
      ))}
    </div>
  )
}

function RouteComponent() {
  const { owner, repo, number } = useParams({ from: Route.id })
  const { data } = usePRQuery(owner, repo, Number(number))

  if (!data || !data.repository?.pullRequest) {
    return null
  }

  return (
    <div>
      <Diff data={data.repository?.pullRequest} owner={owner} repo={repo} />
    </div>
  )
}
