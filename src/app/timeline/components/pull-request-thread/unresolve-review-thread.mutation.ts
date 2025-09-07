export const UnresolveReviewThreadMutation = /* GraphQL */ `
  mutation UnresolveReviewThread($input: UnresolveReviewThreadInput!) {
    unresolveReviewThread(input: $input) {
      clientMutationId
      thread {
        id
        isResolved
        resolvedBy {
          login
          avatarUrl
        }
      }
    }
  }
`;
