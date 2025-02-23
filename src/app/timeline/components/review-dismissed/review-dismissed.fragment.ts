export const ReviewDismissedFragment = /* GraphQL */ `
  fragment ReviewDismissedFragment on ReviewDismissedEvent {
    id
    actor {
      ...ActorFragment
    }
    review {
      author {
        login
        url
      }
    }
    dismissalMessage
    pullRequestCommit {
      commit {
        url
        abbreviatedOid
      }
    }
  }
`;
