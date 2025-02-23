export const UnlabeledEventFragment = /* GraphQL */ `
  fragment UnlabeledEventFragment on UnlabeledEvent {
    id
    actor {
      ...ActorFragment
    }
    label {
      name
      color
    }
  }
`;
