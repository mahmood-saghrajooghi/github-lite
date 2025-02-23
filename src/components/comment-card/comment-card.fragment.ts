export const IssueCommentFragment = /* GraphQL */ `
  fragment IssueCommentFragment on IssueComment {
    id
    body
    createdAt
    author {
      ...ActorFragment
    }
    reactionGroups {
      ...ReactionFragment
    }
  }
`;
