export const CrossReferencedEventFragment = /* GraphQL */ `
  fragment CrossReferencedEventFragment on CrossReferencedEvent {
    id
    actor {
      ...ActorFragment
    }
    isCrossRepository
    source {
      __typename
      ...on Issue {
        title
        number
        url
        number
        repository {
          name
          url
          owner {
            login
            avatarUrl
          }
        }
        issueState: state
      }
      ...on PullRequest {
        title
        number
        url
        number
        repository {
          name
          url
          owner {
            login
            avatarUrl
          }
        }
        pullRequestState: state
      }
    }
  }
`;
