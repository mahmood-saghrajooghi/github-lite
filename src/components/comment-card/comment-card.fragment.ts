import { ActorFragment } from '@/components/user/user.fragment';
import { ReactionFragment } from './reactions.fragment';

export const IssueCommentFragment = /* GraphQL */ `
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

  ${ActorFragment}
  ${ReactionFragment}
`;
