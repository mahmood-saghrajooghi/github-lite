import { CommentCard } from '@/components/comment-card/comment-card';
import { QuickFocus } from '@/components/quick-focus';
import { FoldTrap } from '@/components/ui/fold-trap';
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
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FoldVertical, UnfoldVertical } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';
import { useIsFocused } from '@/hooks/use-is-focused';

// Define which timeline items are considered "important" and should always be visible
const isImportantItem = (item: IssueTimelineItems | PullRequestTimelineItems | null): boolean => {
  if (!item) return false;

  switch (item.__typename) {
    case 'IssueComment':
    case 'PullRequestReview':
      return true;
    default:
      return false;
  }
};

// Group consecutive unimportant items together
function groupTimelineItems(items: (IssueTimelineItems | PullRequestTimelineItems | null)[]) {
  const grouped: Array<{
    type: 'important' | 'collapsed';
    items: (IssueTimelineItems | PullRequestTimelineItems | null)[];
  }> = [];

  let currentGroup: (IssueTimelineItems | PullRequestTimelineItems | null)[] = [];
  let isCurrentGroupImportant = false;

  for (const item of items) {
    const itemIsImportant = isImportantItem(item);

    if (currentGroup.length === 0) {
      // Start new group
      currentGroup = [item];
      isCurrentGroupImportant = itemIsImportant;
    } else if (itemIsImportant === isCurrentGroupImportant) {
      // Add to current group
      currentGroup.push(item);
    } else {
      // Start new group
      grouped.push({
        type: isCurrentGroupImportant ? 'important' : 'collapsed',
        items: currentGroup
      });
      currentGroup = [item];
      isCurrentGroupImportant = itemIsImportant;
    }
  }

  // Add final group
  if (currentGroup.length > 0) {
    grouped.push({
      type: isCurrentGroupImportant ? 'important' : 'collapsed',
      items: currentGroup
    });
  }

  return grouped;
}

function CollapsedTimelineItems({ items }: { items: (IssueTimelineItems | PullRequestTimelineItems | null)[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isFocused, handleFocus, handleBlur } = useIsFocused();

  const getEventDescription = (item: IssueTimelineItems | PullRequestTimelineItems | null) => {
    if (!item) return 'Unknown event';

    switch (item.__typename) {
      case 'AutomaticBaseChangeSucceededEvent':
        return 'Base branch changed';
      case 'PullRequestCommit':
        return 'Committed changes';
      case 'HeadRefForcePushedEvent':
        return 'Force pushed';
      case 'ReviewDismissedEvent':
        return 'Review dismissed';
      case 'RenamedTitleEvent':
        return 'Title renamed';
      case 'LabeledEvent':
        return 'Label added';
      case 'UnlabeledEvent':
        return 'Label removed';
      case 'ClosedEvent':
        return 'Closed';
      case 'ReopenedEvent':
        return 'Reopened';
      case 'MergedEvent':
        return 'Merged';
      case 'HeadRefDeletedEvent':
        return 'Branch deleted';
      case 'CrossReferencedEvent':
        return 'Cross-referenced';
      case 'ReferencedEvent':
        return 'Referenced';
      case 'ReviewRequestedEvent':
        return 'Review requested';
      case 'ConvertToDraftEvent':
        return 'Converted to draft';
      case 'ReadyForReviewEvent':
        return 'Ready for review';
      case 'CommentDeletedEvent':
        return 'Comment deleted';
      default:
        return 'Timeline event';
    }
  };

  const renderTimelineItem = (item: IssueTimelineItems | PullRequestTimelineItems | null, i: number) => {
    switch (item?.__typename) {
      case 'AutomaticBaseChangeSucceededEvent':
        return <BaseChanged key={item.id} data={item} />;
      case 'PullRequestCommit':
        return <Committed key={item.id} data={item as unknown as CommittedEventFragmentFragment} />;
      case 'HeadRefForcePushedEvent':
        return <ForcePushed key={item.id} data={item} />;
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
  };

  if (items.length === 0) return null;

  const eventDescriptions = items.slice(0, 3).map(getEventDescription).join(', ');
  const summaryText = `${items.length} ${items.length === 1 ? 'activity' : 'activities'} happened`;

  return (
    <div className="grid items-center gap-2"
      style={{
        gridTemplateAreas: `
          "icon description"
          ".    content"
        `,
        gridTemplateColumns: 'min-content 1fr',
      }}
    >
      <div className="rounded-full px-1.5 aspect-square flex items-center bg-muted text-muted-foreground" style={{ gridArea: 'icon' }}>
        {isExpanded ? <FoldVertical className="h-4 w-4" /> : <UnfoldVertical className="h-4 w-4" />}
      </div>
      <div className="text-sm text-muted-foreground" style={{ gridArea: 'description' }}>
        {summaryText}
      </div>
      <div style={{ gridArea: 'content' }}>
        <FoldTrap toggleExpanded={() => setIsExpanded(!isExpanded)} asChild onFocus={handleFocus} onBlur={handleBlur}>
          <QuickFocus asChild>
            <Card className="p-3">
              <div className="w-full flex justify-between items-center">
                <span className="text-xs">
                  {eventDescriptions}${items.length > 3 ? '...' : ''}
                </span>
                <div className="flex items-center gap-2">
                  {isFocused && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-neutral-900 border border-border rounded-md px-1.5 py-0.5 select-none">
                      {isExpanded && (
                        <div className="flex items-center gap-1">
                          <Kbd className="text-[11px] min-w-[18px] w-auto px-[4px] h-[18px] rounded-sm">F</Kbd> fold
                        </div>
                      )}
                      {!isExpanded && (
                        <div className="flex items-center gap-1">
                          <Kbd className="text-[11px] min-w-[18px] w-auto px-[4px] h-[18px] rounded-sm">F</Kbd> unfold
                        </div>
                      )}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-6 w-6 p-0 hover:bg-muted"
                  >
                    {isExpanded ? <FoldVertical className="h-4 w-4" /> : <UnfoldVertical className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="relative">
                    <div className="h-[calc(100%-40px)] w-[1px] bg-zinc-600 absolute left-3.5 top-[20px]" />
                    <div className="flex flex-col gap-4 relative">
                      {items.map((item, i) => renderTimelineItem(item, i))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </QuickFocus>
        </FoldTrap>


      </div>
    </div>
  );
}

export function Timeline({ items }: { items: (IssueTimelineItems | PullRequestTimelineItems | null)[] }) {
  const groupedItems = groupTimelineItems(items);

  const renderTimelineItem = (item: IssueTimelineItems | PullRequestTimelineItems | null) => {
    switch (item?.__typename) {
      case 'IssueComment':
        return (
          <QuickFocus asChild key={item.id}>
            <CommentCard data={item} />
          </QuickFocus>
        );
      case 'PullRequestReview':
        return <Reviewed key={item.id} data={item} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="h-[calc(100%-30px)] w-[1px] bg-zinc-600 absolute left-3.5 top-[10px]" />
      <div className="z-10 flex flex-col gap-6 text-sm relative">
        {groupedItems.map((group, groupIndex) => {
          if (group.type === 'important') {
            return group.items.map((item) => renderTimelineItem(item));
          } else {
            // Only show collapsed view if there are 2 or more unimportant items
            if (group.items.length >= 2) {
              return <CollapsedTimelineItems key={`collapsed-${groupIndex}`} items={group.items} />;
            } else {
              // Show single unimportant item normally
              return group.items.map((item, i) => {
                switch (item?.__typename) {
                  case 'AutomaticBaseChangeSucceededEvent':
                    return <BaseChanged key={item.id} data={item} />;
                  case 'PullRequestCommit':
                    return <Committed key={item.id} data={item as unknown as CommittedEventFragmentFragment} />;
                  case 'HeadRefForcePushedEvent':
                    return <ForcePushed key={item.id} data={item} />;
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
              });
            }
          }
        })}
      </div>
    </div>
  );
}
