import { IssueTimelineFragment } from './issue.fragment';
import { BaseChangeEventFragment } from './components/base-changed/base-changed.fragment';
import { CommittedEventFragment } from './components/committed/committed.fragment';
import { ForcePushedEventFragment } from './components/force-pushed/force-pushed.fragment';
import { ReviewedEventFragment } from './components/reviewed/reviewed.fragment';
import { ReviewDismissedFragment } from './components/review-dismissed/review-dismissed.fragment';
import { MergedEventFragment } from './components/merged/merged.fragment';
import { BranchDeletedEventFragment } from './components/branch-deleted/branch-deleted.fragment';
import { ReviewRequestedEventFragment } from './components/review-requested/review-requested.fragment';
import { ConvertToDraftEventFragment } from './components/convert-to-draft/convert-to-draft.fragment';
import { ReadyForReviewEventFragment } from './components/ready-for-review/ready-for-review.fragment';
import { ActorFragment } from '@/components/user/user.fragment';
import { ReactionFragment } from '@/components/comment-card/reactions.fragment';

export const PullRequestTimelineFragment = /* GraphQL */ `
  fragment PullRequestTimelineFragment on PullRequestTimelineItems {
    ...IssueTimelineFragment
    ...BaseChangeEventFragment
    ...CommittedEventFragment
    ...ForcePushedEventFragment
    ...ReviewedEventFragment
    ...ReviewDismissedFragment
    ...MergedEventFragment
    ...BranchDeletedEventFragment
    ...ReviewRequestedEventFragment
    ...ConvertToDraftEventFragment
    ...ReadyForReviewEventFragment
  }

  ${IssueTimelineFragment}
  ${BaseChangeEventFragment}
  ${CommittedEventFragment}
  ${ForcePushedEventFragment}
  ${ReviewedEventFragment}
  ${ReviewDismissedFragment}
  ${MergedEventFragment}
  ${BranchDeletedEventFragment}
  ${ReviewRequestedEventFragment}
  ${ConvertToDraftEventFragment}
  ${ReadyForReviewEventFragment}

  ${ActorFragment}
  ${ReactionFragment}
`;
