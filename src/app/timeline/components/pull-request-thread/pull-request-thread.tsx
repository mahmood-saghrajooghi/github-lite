import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Avatar } from '@/app/components';
import { Card } from '@/components/ui/card';
import { CommentForm } from '@/app/CommentForm';
import { github } from '@/lib/client';
import type { User } from '@octokit/graphql-schema';
import type { AddPullRequestReviewThreadReplyInput, PullRequestReviewThread } from '@/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import { CommentBody } from '@/components/comment-card/comment-body';
import { Reactions } from '@/components/comment-card/reactions';
import { AddPullRequestReviewThreadReplyMutation } from './add-pull-request-review-thread-reply.mutation';
import { useIsFocused } from '@/hooks/use-is-focused';
import { Kbd } from '@/components/ui/kbd';
import { ReplyTrap } from '@/components/ui/reply-trap';
import { QuickFocus } from '@/components/quick-focus';
import { queryClient } from '@/query-client';
import { getQueryKey } from '@/hooks/api/use-pr-query';
import { useUser } from '@/hooks/api/use-user';
import { IssueTimelineQuery, PullRequestReviewComment, ReactionGroup } from '@/generated/graphql'

function optimisticallyAddPullRequestReviewThreadReply({ reviewThread, user, values }: { reviewThread: PullRequestReviewThread, user: User | undefined, values: { body: string } }) {
  const owner = reviewThread.repository.owner.login;
  const repo = reviewThread.repository.name;
  const number = reviewThread.pullRequest.number;
  const threadId = reviewThread.id;
  const queryKey = getQueryKey(owner, repo, number);
  queryClient.setQueryData(queryKey, (data: IssueTimelineQuery) => {
    const thread = data?.repository?.pullRequest?.reviewThreads.nodes?.find(thread => thread?.id === threadId);

    if (!thread || !user) {
      return data;
    }

    const newComment: Partial<PullRequestReviewComment> = {
      author: {
        login: user.login,
        avatarUrl: user.avatarUrl,
        url: user.url,
        resourcePath: user.url,
      },
      body: values.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reactionGroups: data.repository?.pullRequest?.reactionGroups as ReactionGroup[]
    }

    const updatedThreadNodes = data.repository?.pullRequest?.reviewThreads.nodes?.map(thread => {
      if (thread?.id === threadId) {
        return {
          ...thread,
          comments: {
            nodes: [...(thread.comments.nodes ?? []), newComment]
          }
        }
      }
      return thread;
    });

    return {
      ...data,
      repository: {
        ...data.repository,
        pullRequest: {
          ...data.repository?.pullRequest,
          reviewThreads: {
            nodes: updatedThreadNodes
          }
        }
      }
    }
  });
}


export function PullRequestThread({ data }: { data: PullRequestReviewThread }) {
  const { isFocused, handleFocus, handleBlur } = useIsFocused();
  const { data: user } = useUser();
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };


  const { mutate } = useMutation({
    mutationFn: async (body: string) => {
      optimisticallyAddPullRequestReviewThreadReply({
        reviewThread: data,
        user: user,
        values: {
          body
        }
      });
      await github.graphql(AddPullRequestReviewThreadReplyMutation, {
        input: {
          body,
          clientMutationId: '1',
          pullRequestReviewThreadId: data.id,
        } as AddPullRequestReviewThreadReplyInput
      });
      queryClient.invalidateQueries({ queryKey: getQueryKey(data.repository.owner.login, data.repository.name, data.pullRequest.number) });
    }
  });

  const onSubmit = async (body: string): Promise<void> => {
    return mutate(body);
  };
  return (
    <ReplyTrap asChild onFocus={handleFocus} onBlur={handleBlur}>
      <QuickFocus asChild>
        <Card>
          <div className="text-sm cursor-default p-3">
            {data.path}
          </div>
          <div>
            <div className="flex flex-col gap-3 p-3 border-t border-input">
              {data.comments.nodes?.map((comment: PullRequestReviewComment | null) => (
                <div className="flex gap-2">
                  <div>
                    <span className="inline-flex items-center align-bottom">
                      <Avatar src={comment!.author!.avatarUrl} className="inline mr-2" />
                    </span>
                  </div>
                  <div key={comment!.id} className="flex-1 flex flex-col gap-2">
                    <div>
                      <Link href={comment!.author!.url} target="_blank" className="font-semibold hover:underline">{comment!.author!.login}</Link>
                      {comment && (
                        <span className="text-xs text-muted-foreground" style={{ gridArea: 'date' }}>
                          {' • '}
                          {formatDate(comment!.createdAt)}
                        </span>
                      )}
                    </div>
                    <div>
                      <CommentBody>{comment!.body}</CommentBody>
                    </div>
                    {comment!.reactionGroups && <Reactions id={comment!.id} data={comment!.reactionGroups} />}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-input">
              <CommentForm onSubmit={onSubmit}>
                {data.viewerCanResolve &&
                  <Button className="flex-shrink-0 px-4 py-2 rounded-md bg-accent pressed:bg-accent/80 border border-accent pressed:border-accent/80 text-foreground text-sm font-medium cursor-default outline-none focus-visible:ring-2 ring-offset-2 ring-blue-600">
                    Resolve conversation
                  </Button>
                }
              </CommentForm>
            </div>
          </div>
          {isFocused && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              Press <Kbd className="text-[11px] w-[18px] h-[18px] rounded-sm">R</Kbd> to reply
            </div>
          )}
        </Card>
      </QuickFocus>
    </ReplyTrap>
  );
}
