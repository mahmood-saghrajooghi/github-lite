
import { ClosedEvent } from '@octokit/graphql-schema';
import { Icon } from '@/app/components';
import { IssueClosedIcon, SkipIcon } from '@primer/octicons-react';
import { User } from '@/components/user/user';


export function Closed({ data }: { data: ClosedEvent }) {
  return (
    <div className="flex items-center gap-2">
      {data.stateReason === "NOT_PLANNED" ? (
        <Icon className="bg-accent text-muted-foreground"><SkipIcon /></Icon>
      ) : (
        <Icon className="bg-purple-600 text-white"><IssueClosedIcon /></Icon>
      )}
      <span><User actor={data.actor!} /> closed this as {data.stateReason?.toLowerCase()}</span>
    </div>
  );
}
