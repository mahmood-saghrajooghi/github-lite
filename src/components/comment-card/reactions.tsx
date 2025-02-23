

import { ReactionContent, ReactionGroup } from '@/generated/graphql';
import { SmileyIcon } from '@primer/octicons-react';
import { useState } from 'react';
import { Button, ButtonIcon } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { graphql } from '@/lib/client';

import { ReactionFragment } from './reactions.fragment.ts';

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
      const data = graphql<{ addReaction: { reactionGroups: ReactionGroup[] } }>(/* GraphQL */ `
        mutation AddReaction($input: AddReactionInput!) {
          addReaction(input: $input) {
            reactionGroups {
              ...ReactionFragment
            }
          }
        }

        ${ReactionFragment}
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

      ${ReactionFragment}
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
            // FIXME: type errors here, see if it is working
            // pressed={r.viewerHasReacted}
            // onPressedChange={pressed => toggleReaction(r.content, pressed)}
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
