import { ReopenedEvent } from '@octokit/graphql-schema';
import { Icon } from '@/app/components';
import { IssueReopenedIcon } from '@primer/octicons-react';
import { User } from '@/components/user/user';

export function Reopened({ data }: { data: ReopenedEvent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="bg-green-600 text-white"><IssueReopenedIcon /></Icon>
      <span><User actor={data.actor!} /> reopened this</span>
    </div>
  );
}
