export const ClosedEventFragment = /* GraphQL */ `
  fragment ClosedEventFragment on ClosedEvent {
    id
    actor {
      ...ActorFragment
    }
    stateReason
  }
`;
