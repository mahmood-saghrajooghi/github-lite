import { CommentCard } from '@/components/comment-card/comment-card';
import { QuickFocus } from '@/components/quick-focus';
import { BaseChanged } from './components/base-changed/base-changed';
import { Committed } from './components/committed/committed';
import { ForcePushed } from './components/force-pushed/force-pushed';
import { Reviewed } from './components/reviewed/reviewed';
import { ReviewDismissed } from './components/review-dismissed/review-dismissed';
import { Renamed } from './components/renamed/renamed';
import { Labeled } from './components/labeled/labeled';
import { Unlabeled } from './components/unlabeled/unlabeled';
import { Closed } from './components/closed/closed';
import { Reopened } from './components/reopened/reopened';
import { Merged } from './components/merged/merged';
import { BranchDeleted } from './components/branch-deleted/branch-deleted';
import { CrossReferenced } from './components/cross-referenced/cross-referenced';
import { Referenced } from './components/referenced/referenced';
import { ReviewRequested } from './components/review-requested/review-requested';
import { ConvertToDraft } from './components/convert-to-draft/convert-to-draft';
import { ReadyForReview } from './components/ready-for-review/ready-for-review';
import { CommentDeleted } from './components/comment-deleted/comment-deleted';
import { IssueTimelineItems, PullRequestTimelineItems, CommittedEventFragmentFragment } from '@/generated/graphql';


export function Timeline({ items }: { items: (IssueTimelineItems | PullRequestTimelineItems | null)[] }) {
  return (
    <div className="relative">
      <div className="h-[calc(100%-30px)] w-[1px] bg-zinc-600 absolute left-3.5 top-[10px]" />
      <div className="z-10 flex flex-col gap-6 text-sm relative" >
        {items.map((item, i) => {
          switch (item?.__typename) {
            case 'IssueComment':
              return (
                <QuickFocus asChild key={item.id}>
                  <CommentCard data={item} />
                </QuickFocus>
              );
            case 'AutomaticBaseChangeSucceededEvent':
              return <BaseChanged key={item.id} data={item} />;
            case 'PullRequestCommit':
              return <Committed key={item.id} data={item as unknown as CommittedEventFragmentFragment} />;
            case 'HeadRefForcePushedEvent':
              return <ForcePushed key={item.id} data={item} />;
            case 'PullRequestReview':
              return (
                <QuickFocus asChild key={item.id}>
                  <Reviewed data={item} />
                </QuickFocus>
              );
            case 'ReviewDismissedEvent':
              return <ReviewDismissed key={item.id} data={item} />;
            case 'RenamedTitleEvent':
              return <Renamed key={item.id} data={item} />;
            case 'LabeledEvent':
              return <Labeled key={item.id} data={item} />;
            case 'UnlabeledEvent':
              return <Unlabeled key={item.id} data={item} />;
            case 'ClosedEvent':
              return <Closed key={item.id} data={item} />;
            case 'ReopenedEvent':
              return <Reopened key={item.id} data={item} />;
            case 'MergedEvent':
              return <Merged key={item.id} data={item} />;
            case 'HeadRefDeletedEvent':
              return <BranchDeleted key={item.id} data={item} />;
            case 'CrossReferencedEvent':
              return <CrossReferenced key={item.id} data={item} />;
            case 'ReferencedEvent':
              return <Referenced key={item.id} data={item} />;
            case 'ReviewRequestedEvent':
              return <ReviewRequested key={item.id} data={item} />;
            case 'ConvertToDraftEvent':
              return <ConvertToDraft key={item.id} data={item} />;
            case 'ReadyForReviewEvent':
              return <ReadyForReview key={item.id} data={item} />;
            case 'CommentDeletedEvent':
              return <CommentDeleted key={item.id} data={item} />;
            case 'MentionedEvent':
            case 'SubscribedEvent':
              return null;
            default:
              return <p key={i}>Unknown event <code className="break-all">{JSON.stringify(item)}</code></p>;
          }
        })}
      </div>
    </div>
  );
}
