export const BranchDeletedEventFragment = /* GraphQL */ `
  fragment BranchDeletedEventFragment on HeadRefDeletedEvent {
    id
    actor {
      ...ActorFragment
    }
    headRefName
  }
`;
