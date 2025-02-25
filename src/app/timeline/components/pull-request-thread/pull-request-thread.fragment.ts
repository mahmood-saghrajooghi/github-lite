export const PullRequestThreadFragment = /* GraphQL */ `
  fragment PullRequestThreadFragment on PullRequestReviewThread {
    id
    isCollapsed
    isOutdated
    isResolved
    repository {
      owner {
        login
      }
      name
    }
    pullRequest {
      number
    }
    resolvedBy {
      ...ActorFragment
    }
    line
    path
    diffSide
    viewerCanResolve
    comments(first:100) {
      nodes {
        id
        author {
          ...ActorFragment
        }
        body
        createdAt
        reactionGroups {
          ...ReactionFragment
        }
        isMinimized
        minimizedReason
        startLine
        line
        path
        state
        outdated
      }
    }
  }
`;
