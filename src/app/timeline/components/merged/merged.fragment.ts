export const MergedEventFragment = /* GraphQL */ `
  fragment MergedEventFragment on MergedEvent {
    id
    actor {
      ...ActorFragment
    }
    commit {
      url
      abbreviatedOid
    }
    mergeRefName
  }
`;
