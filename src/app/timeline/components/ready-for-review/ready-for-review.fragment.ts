import { ActorFragment } from '@/components/user/user.fragment';

export const ReadyForReviewEventFragment = /* GraphQL */ `
  fragment ReadyForReviewEventFragment on ReadyForReviewEvent {
    actor {
      ...ActorFragment
    }
  }

  ${ActorFragment}
`;
