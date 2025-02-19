import { Issue, IssueComment, PullRequest, PullRequestReviewComment, ReactionContent, ReactionGroup } from '@octokit/graphql-schema';
import { SmileyIcon } from '@primer/octicons-react';
import Markdown from 'markdown-to-jsx';
import { useState } from 'react';
import { Button, ButtonIcon } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Avatar } from './components';
import { graphql } from '@/lib/client';

export function CommentCard({ data }: { data: Issue | PullRequest | IssueComment | PullRequestReviewComment }) {
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
    <div className="border border-input rounded-lg p-4 bg-background">
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
    </div>

  );
}

CommentCard.fragment = `
fragment IssueCommentFragment on IssueComment {
  id
  body
  createdAt
  author {
    ...ActorFragment
  }
  reactionGroups {
    ...ReactionFragment
  }
}
`;

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
          component: (props: any) => (
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

const emojis: Record<ReactionContent, string> = {
  THUMBS_UP: '👍',
  THUMBS_DOWN: '👎',
  CONFUSED: '😕',
  EYES: '👀',
  HEART: '❤️',
  HOORAY: '🎉',
  LAUGH: '😄',
  ROCKET: '🚀'
};

export function Reactions({ id, data: initialData }: { id: string, data: ReactionGroup[] }) {
  const [data, setData] = useState(initialData);
  const toggleReaction = async (emoji: ReactionContent, isSelected: boolean) => {
    if (isSelected) {
      const data = graphql<{ addReaction: { reactionGroups: ReactionGroup[] } }>(`
        mutation AddReaction($input: AddReactionInput!) {
          addReaction(input: $input) {
            reactionGroups {
              ...ReactionFragment
            }
          }
        }

        ${Reactions.fragment}
      `, { input: { subjectId: id, content: emoji } });
      setData((await data).addReaction.reactionGroups);
    } else {
      const data = await graphql<{ removeReaction: { reactionGroups: ReactionGroup[] } }>(`
      mutation RemoveReaction($input: RemoveReactionInput!) {
        removeReaction(input: $input) {
          reactionGroups {
            ...ReactionFragment
          }
        }
      }

      ${Reactions.fragment}
    `, { input: { subjectId: id, content: emoji } });
      setData(data.removeReaction.reactionGroups);
    }
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ButtonIcon>
              <SmileyIcon />
            </ButtonIcon>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex gap-2 p-1.5 w-auto" align="start">
          {Object.keys(emojis).map(emoji => (
            <Button
              key={emoji}
              variant={data.find(r => r.content === emoji)?.viewerHasReacted ? "default" : "ghost"}
              size="sm"
              className="text-md"
              onClick={() => {
                toggleReaction(
                  emoji as ReactionContent,
                  !data.find(r => r.content === emoji)?.viewerHasReacted
                )
              }}
            >
              {emojis[emoji as ReactionContent]}
            </Button>
          ))}
        </PopoverContent>
      </Popover>
      <ToggleGroup type="multiple" variant="ghost" size="sm">
        {data.filter(r => r.reactors.totalCount > 0).map(r => (
          <ToggleGroupItem
            key={r.content}
            value={r.content}
            pressed={r.viewerHasReacted}
            onPressedChange={pressed => toggleReaction(r.content, pressed)}
            className="h-8 min-w-8"
          >
            <span>{emojis[r.content]}</span>
            {r.reactors.totalCount > 1 ? r.reactors.totalCount : ''}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

Reactions.fragment = `
fragment ReactionFragment on ReactionGroup {
  content
  viewerHasReacted
  reactors {
    totalCount
  }
}
`;
