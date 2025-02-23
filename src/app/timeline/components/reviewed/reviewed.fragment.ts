import { ActorFragment } from '@/components/user/user.fragment';
import { ReactionFragment } from '@/components/comment-card/reactions.fragment';

export const ReviewedEventFragment = /* GraphQL */ `
  fragment ReviewedEventFragment on PullRequestReview {
    id
    author {
      ...ActorFragment
    }
    body
    createdAt
    reactionGroups {
      ...ReactionFragment
    }
    state
    comments(first:100) {
      nodes {
        id
      }
    }
  }

  ${ActorFragment}
  ${ReactionFragment}
`;
