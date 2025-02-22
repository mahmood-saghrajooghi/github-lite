import { PullRequestReview } from '@octokit/graphql-schema';
import { CheckCircleIcon, GitPullRequestClosedIcon, EyeIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { Card } from '@/components/ui/card';
import { CommentBody } from '@/components/comment-card/comment-card';
import { useIsFocused } from '@/hooks/use-is-focused';
import { Kbd } from '@/components/ui/kbd';
import { PullRequestThread } from '../pull-request-thread/pull-request-thread';
import { usePullRequest } from '@/app/PullRequest';
import { cn } from '@/lib/utils';
import { ReplyTrap } from '@/components/ui/reply-trap';
import { User } from '@/components/user/user';


export function Reviewed({ data, style, className, ...props }: { data: PullRequestReview } & React.HTMLAttributes<HTMLDivElement>) {
  const { threadsById } = usePullRequest();
  const { isFocused, handleFocus, handleBlur } = useIsFocused();

  return (
    <div
      className="grid items-center gap-2"
      style={{
        gridTemplateAreas: `
          "icon description"
          ".    issue"
        `,
        gridTemplateColumns: 'min-content 1fr',
      }}
    >
      {data.state === 'CHANGES_REQUESTED'
        ? <Icon className="bg-red-600 text-white"><GitPullRequestClosedIcon /></Icon>
        : data.state === 'APPROVED'
          ? <Icon className="bg-green-600 text-white"><CheckCircleIcon /></Icon>
          : <Icon className="bg-accent text-muted-foreground"><EyeIcon /></Icon>}
      <div style={{ gridArea: 'description' }}><User actor={data.author!} />  {data.state === 'CHANGES_REQUESTED' ? 'requested changes' : data.state === 'APPROVED' ? 'approved' : 'reviewed'}</div>
      {(data.body || !!data.comments?.nodes?.length) && (
        <div style={{ gridArea: 'issue' }}>
          <ReplyTrap
            style={style}
            className={cn("flex flex-col gap-2 rounded-md", className)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {data.body &&
              <Card>
                <CommentBody>{data.body}</CommentBody>
              </Card>
            }
            {data.comments.nodes?.map(comment => {
              const thread = threadsById.get(comment?.id ?? '');
              if (thread) {
                return <PullRequestThread key={thread.id} data={thread} />;
              }
            })}
          </ReplyTrap>
          {isFocused && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              Press <Kbd className="text-[11px] w-[18px] h-[18px] rounded-sm">R</Kbd> to reply
            </div>
          )}
        </div >
      )
      }
    </div >
  );
}
