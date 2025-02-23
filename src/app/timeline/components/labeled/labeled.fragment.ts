export const LabeledEventFragment = /* GraphQL */ `
  fragment LabeledEventFragment on LabeledEvent {
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
