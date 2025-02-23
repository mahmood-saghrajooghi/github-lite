export const CommittedEventFragment = /* GraphQL */ `
  fragment CommittedEventFragment on PullRequestCommit {
    id
    commitedCommit: commit {
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
