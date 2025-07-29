import { ReopenedEvent } from '@/generated/graphql';
import { Icon } from '@/app/components';
import { IssueReopenedIcon } from '@primer/octicons-react';
import { User } from '@/components/user/user';

export function Reopened({ data }: { data: ReopenedEvent }) {
  return (
    <div className="flex gap-2">
      <Icon className="bg-green-600 text-white"><IssueReopenedIcon /></Icon>
      <span className="text-muted-foreground mt-1"><User actor={data.actor!} /> reopened this</span>
    </div>
  );
}
