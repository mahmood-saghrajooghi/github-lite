export const AddPullRequestReviewThreadReplyMutation = /* GraphQL */ `
  mutation addPullRequestReviewThreadReply($input: AddPullRequestReviewThreadReplyInput!) {
    addPullRequestReviewThreadReply(input: $input) {
      clientMutationId
      comment {
        id
        author {
          login
          avatarUrl
        }
        body
        createdAt
      }
    }
  }
`;
