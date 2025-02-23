export const CommentDeletedEventFragment = /* GraphQL */ `
  fragment CommentDeletedEventFragment on CommentDeletedEvent {
    actor {
      ...ActorFragment
    }
  deletedCommentAuthor {
    login
    url
    }
  }
`;
