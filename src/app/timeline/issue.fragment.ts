import { RenamedTitleFragment } from './components/renamed/renamed.fragment';
import { LabeledEventFragment } from './components/labeled/labeled.fragment';
import { UnlabeledEventFragment } from './components/unlabeled/unlabeled.fragment';
import { ClosedEventFragment } from './components/closed/closed.fragment';
import { ReopenedEventFragment } from './components/reopened/reopened.fragment';
import { CrossReferencedEventFragment } from './components/cross-referenced/cross-referenced.fragment';
import { ReferencedEventFragment } from './components/referenced/referenced.fragment';
import { CommentDeletedEventFragment } from './components/comment-deleted/comment-deleted.fragment';
import { IssueCommentFragment } from '@/components/comment-card/comment-card.fragment';


export const IssueTimelineFragment = /* GraphQL */ `
  fragment IssueTimelineFragment on PullRequestTimelineItems {
    __typename
    ...IssueCommentFragment
    ...RenamedTitleFragment
    ...LabeledEventFragment
    ...UnlabeledEventFragment
    ...ClosedEventFragment
    ...ReopenedEventFragment
    ...CrossReferencedEventFragment
    ...ReferencedEventFragment
    ...CommentDeletedEventFragment
  }

  ${IssueCommentFragment}
  ${RenamedTitleFragment}
  ${LabeledEventFragment}
  ${UnlabeledEventFragment}
  ${ClosedEventFragment}
  ${ReopenedEventFragment}
  ${CrossReferencedEventFragment}
  ${ReferencedEventFragment}
  ${CommentDeletedEventFragment}
`;
