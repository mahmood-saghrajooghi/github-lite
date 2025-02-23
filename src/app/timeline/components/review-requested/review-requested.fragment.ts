import { ActorFragment } from '@/components/user/user.fragment';
export const ReviewRequestedEventFragment = /* GraphQL */ `
  fragment ReviewRequestedEventFragment on ReviewRequestedEvent {
    actor {
      ...ActorFragment
    }
    requestedReviewer {
      ...on Actor {
        login
        url
      }
    }
  }

  ${ActorFragment}
`;
