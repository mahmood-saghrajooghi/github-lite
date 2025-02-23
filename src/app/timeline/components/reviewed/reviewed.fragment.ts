export const ReviewedEventFragment = /* GraphQL */ `
  fragment ReviewedEventFragment on PullRequestReview {
    id
    author {
      ...ActorFragment
    }
    body
    createdAt
    reactionGroups {
      ...ReactionFragment
    }
    state
    comments(first:100) {
      nodes {
        id
      }
    }
  }
`;
