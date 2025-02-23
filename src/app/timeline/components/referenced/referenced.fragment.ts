export const ReferencedEventFragment = /* GraphQL */ `
  fragment ReferencedEventFragment on ReferencedEvent {
    id
    actor {
      ...ActorFragment
    }
    isCrossRepository
    referencedCommit: commit {
      url
      abbreviatedOid
      message
      commitUrl
      author {
        user {
          login
        }
        avatarUrl
      }
      statusCheckRollup {
        state
      }
    }
  }
`;
