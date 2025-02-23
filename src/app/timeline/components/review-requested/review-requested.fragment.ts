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
`;
