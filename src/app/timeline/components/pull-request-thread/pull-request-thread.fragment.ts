import { ActorFragment } from '@/components/user/user.fragment';
import { ReactionFragment } from '@/components/comment-card/reactions.fragment';

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

  ${ActorFragment}
  ${ReactionFragment}
`;
