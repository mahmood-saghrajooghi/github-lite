export const ForcePushedEventFragment = /* GraphQL */ `
  fragment ForcePushedEventFragment on HeadRefForcePushedEvent {
    id
    actor {
      ...ActorFragment
    }
    beforeCommit {
      url
      abbreviatedOid
    }
    afterCommit {
      url
      abbreviatedOid
    }
    ref {
      name
    }
  }
`;
