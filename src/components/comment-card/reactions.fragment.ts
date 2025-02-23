export const ReactionFragment = /* GraphQL */ `
  fragment ReactionFragment on ReactionGroup {
    content
    viewerHasReacted
    reactors {
      totalCount
    }
  }
`;
