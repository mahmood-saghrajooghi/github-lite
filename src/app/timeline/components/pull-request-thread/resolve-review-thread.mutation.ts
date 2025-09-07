export const ResolveReviewThreadMutation = /* GraphQL */ `
  mutation ResolveReviewThread($input: ResolveReviewThreadInput!) {
    resolveReviewThread(input: $input) {
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
