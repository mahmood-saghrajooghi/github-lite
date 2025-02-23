export const RenamedTitleFragment = /* GraphQL */ `
  fragment RenamedTitleFragment on RenamedTitleEvent {
    id
    actor {
      ...ActorFragment
    }
    previousTitle
    currentTitle
  }
`;
