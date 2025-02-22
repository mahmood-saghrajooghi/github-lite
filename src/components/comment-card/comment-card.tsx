import { Issue, IssueComment, PullRequest, PullRequestReviewComment } from '@octokit/graphql-schema';
import { Primitive } from '@radix-ui/react-primitive';
import Markdown from 'markdown-to-jsx';
import { forwardRef } from 'react';
import { Avatar } from '../../app/components';
import { cn } from '@/lib/utils';
import { Reactions } from './reactions';

type CommentCardProps = {
  data: Issue | PullRequest | IssueComment | PullRequestReviewComment
} & React.ComponentPropsWithoutRef<typeof Primitive.div>

export const CommentCard = forwardRef<React.ElementRef<typeof Primitive.div>, CommentCardProps>(({ data, className, ...props }, ref) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  return (
    <Primitive.div
      ref={ref}
      className={cn("border border-input p-4 bg-background rounded-xl", className)}
      {...props}
    >
      <div
        className="grid gap-x-2 mb-4 border-b border-daw-gray-200 pb-4"
        style={{
          gridTemplateAreas: `
            "avatar    username"
            "avatar    date"
          `,
          gridTemplateRows: 'auto auto',
          gridTemplateColumns: '40px 1fr'
        }}>
        <Avatar size="l" className="[grid-area:avatar]" src={data.author!.avatarUrl} />
        <span className="font-medium text-sm" style={{ gridArea: 'username' }}>{data.author!.login}</span>
        <span className="text-xs text-daw-gray-600" style={{ gridArea: 'date' }}>
          {formatDate(data.createdAt)}
        </span>
      </div>
      <div className="text-sm">
        <CommentBody>{data.body}</CommentBody>
      </div>
      {data.reactionGroups && (
        <div className="mt-2">
          <Reactions id={data.id} data={data.reactionGroups} />
        </div>
      )}
    </Primitive.div>
  );
})

export function CommentBody({ children }: { children: string }) {
  return (
    <Markdown className="[word-break:break-word]" options={{
      overrides: {
        img: { props: { style: { maxWidth: '100%' } } },
        pre: {
          props: {
            className: 'mb-4 bg-accent rounded-md',
            style: {
              whiteSpace: 'pre-wrap'
            }
          }
        },
        code: {
          props: {
            className: 'bg-secondary text-[85%] px-1 py-0.5 rounded-md',
            style: {
              whiteSpace: 'pre-wrap'
            }
          }
        },
        h1: {
          props: { className: 'text-3xl font-semibold my-3 pb-1 border-b-2 border-daw-gray-200' }
        },
        h2: {
          props: { className: 'text-2xl font-semibold my-3' }
        },
        h3: {
          props: { className: 'text-xl font-semibold my-3' }
        },
        li: {
          props: { className: 'mb-1 ml-6 list-disc' }
        },
        ul: {
          props: { className: 'mb-4' }
        },
        a: {
          component: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
            <a
              {...props}
              className="underline hover:text-blue-600"
              target="_blank"
            >
              {props.children}
            </a>
          )
        },
        p: {
          props: {
            className: 'mb-4',
            style: {
              wordBreak: 'break-word'
            }
          }
        }
      },
    }}>
      {children}
    </Markdown>
  );
}
