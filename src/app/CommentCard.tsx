import { Issue, IssueComment, PullRequest, PullRequestReviewComment, ReactionContent, ReactionGroup } from '@octokit/graphql-schema';
import { SmileyIcon } from '@primer/octicons-react';
import Markdown from 'markdown-to-jsx';
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Link } from "react-router-dom"
import { Avatar, Card } from './components';
import { graphql } from '@/lib/client';

export function CommentCard({data}: {data: Issue | PullRequest | IssueComment | PullRequestReviewComment}) {
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
    <Card>
      <div
        className="grid gap-x-2"
        style={{
          gridTemplateAreas: `
            "avatar    username"
            "avatar    date"
            ".         ."
            "body      body"
            ".         ."
            "reactions reactions"
          `,
          gridTemplateRows: 'auto auto 8px auto 8px auto',
          gridTemplateColumns: '40px 1fr'
        }}>
        <Avatar size="l" className="[grid-area:avatar]" src={data.author!.avatarUrl} />
        <span className="font-medium text-sm" style={{gridArea: 'username'}}>{data.author!.login}</span>
        <span className="text-xs text-daw-gray-600" style={{gridArea: 'date'}}>
          {formatDate(data.createdAt)}
        </span>
        <div style={{gridArea: 'body'}}>
          <CommentBody>{data.body}</CommentBody>
        </div>
        {data.reactionGroups && <Reactions id={data.id} data={data.reactionGroups} />}
      </div>
    </Card>
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

export function CommentBody({children}: {children: string}) {
  return (
    <Markdown className="[word-break:break-word]" options={{
      overrides: {
        img: {props: {style: {maxWidth: '100%'}}},
        pre: {
          props: {
            className: 'border border-daw-gray-200 rounded p-2 bg-daw-gray-50',
            style: {
              whiteSpace: 'pre-wrap'
            }
          }
        },
        h1: {
          props: {className: 'text-3xl font-semibold my-3 pb-1 border-b-2 border-daw-gray-200'}
        },
        h2: {
          props: {className: 'text-2xl font-semibold my-3'}
        },
        h3: {
          props: {className: 'text-xl font-semibold my-3'}
        },
        a: {
          component: (props: any) => (
            <Link
              {...props}
              className="underline hover:text-blue-600"
              target="_blank"
            >
              {props.children}
            </Link>
          )
        },
        p: {
          props: {
            className: 'my-2',
            style: {
              wordBreak: 'break-word'
            }
          }
        }
      }
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

const reactionClass = "rounded-full text-sm bg-daw-gray-100 border border-daw-gray-200 hover:border-daw-gray-300 pressed:border-daw-gray-300 selected:bg-daw-blue-100 selected:border-daw-blue-200 selected:hover:border-daw-blue-300 selected:pressed:border-daw-blue-300 cursor-default flex items-center justify-center outline-none focus-visible:outline-blue-600 outline-offset-2";

export function Reactions({id, data: initialData}: {id: string, data: ReactionGroup[]}) {
  let [data, setData] = useState(initialData);
  let toggleReaction = async (emoji: ReactionContent, isSelected: boolean) => {
    if (isSelected) {
      let data = graphql<{addReaction: {reactionGroups: ReactionGroup[]}}>(`
        mutation AddReaction($input: AddReactionInput!) {
          addReaction(input: $input) {
            reactionGroups {
              ...ReactionFragment
            }
          }
        }

        ${Reactions.fragment}
      `, {input: {subjectId: id, content: emoji}});
      setData((await data).addReaction.reactionGroups);
    } else {
      let data = await graphql<{removeReaction: {reactionGroups: ReactionGroup[]}}>(`
      mutation RemoveReaction($input: RemoveReactionInput!) {
        removeReaction(input: $input) {
          reactionGroups {
            ...ReactionFragment
          }
        }
      }

      ${Reactions.fragment}
    `, {input: {subjectId: id, content: emoji}});
      setData(data.removeReaction.reactionGroups);
    }
  };

  return (
    <div className="flex gap-2" style={{gridArea: 'reactions'}}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <SmileyIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="flex gap-2 p-2" align="start">
          {Object.keys(emojis).map(emoji => (
            <Button
              key={emoji}
              variant={data.find(r => r.content === emoji)?.viewerHasReacted ? "default" : "outline"}
              size="sm"
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
      <ToggleGroup type="multiple" variant="outline">
        {data.filter(r => r.reactors.totalCount > 0).map(r => (
          <ToggleGroupItem
            key={r.content}
            value={r.content}
            pressed={r.viewerHasReacted}
            onPressedChange={pressed => toggleReaction(r.content, pressed)}
            className="px-2 py-0.5"
          >
            {emojis[r.content]} {r.reactors.totalCount}
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
