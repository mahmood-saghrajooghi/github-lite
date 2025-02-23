import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Avatar} from '@/app/components';
import { Card } from '@/components/ui/card';
import { CommentForm } from '@/app/CommentForm';
import { github } from '@/lib/client';
import type { AddPullRequestReviewThreadReplyInput, PullRequestReviewThread  } from '@/generated/graphql';
import { useMutation } from '@tanstack/react-query';
import { CommentBody } from '@/components/comment-card/comment-body';
import { Reactions } from '@/components/comment-card/reactions';
import { AddPullRequestReviewThreadReplyMutation } from './add-pull-request-review-thread-reply.mutation';

export function PullRequestThread({ data }: { data: PullRequestReviewThread }) {
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
    mutationFn: (body: string) => {
      return github.graphql(AddPullRequestReviewThreadReplyMutation, {
        input: {
          body,
          clientMutationId: '1',
          pullRequestReviewThreadId: data.id,
        } as AddPullRequestReviewThreadReplyInput
      });
    }
  });

  const onSubmit = async (body: string): Promise<void> => {
    return mutate(body);
  };

  return (
    <Card>
      <div className="text-sm cursor-default p-3">
        {data.path}
      </div>
      <div>
        <div className="flex flex-col gap-3 p-3 border-t border-input">
          {data.comments.nodes?.map(comment => (
            <div className="flex gap-2">
              <div>
                <span className="inline-flex items-center align-bottom">
                  <Avatar src={comment!.author!.avatarUrl} className="inline mr-2" />
                </span>
              </div>
              <div key={comment!.id} className="flex-1 flex flex-col gap-2">
                <div>
                  <Link href={comment!.author!.url} target="_blank" className="font-semibold hover:underline">{comment!.author!.login}</Link>
                  <span className="text-xs text-muted-foreground" style={{ gridArea: 'date' }}>
                    {' • '}
                    {formatDate(comment!.createdAt)}
                  </span>
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
    </Card>
  );
}
