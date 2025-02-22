import { PullRequestCommit } from '@octokit/graphql-schema';
import { GitCommitIcon } from '@primer/octicons-react';
import { Link } from '@tanstack/react-router';
import { CommitLink } from '../commit-link/commit-link';
import { Icon, Avatar, Status } from '@/app/components';

export function Committed({ data }: { data: PullRequestCommit }) {
  return (
    <div className="flex gap-2 items-center">
      <Icon className="text-zinc-300 bg-background h-5"><GitCommitIcon /></Icon>
      <Avatar src={data.commit.author!.avatarUrl} />
      <span className="flex-1 line-clamp-2"><Link to={data.commit.commitUrl} target="_blank" className="hover:underline text-muted-foreground">{data.commit.message}</Link></span>
      {data.commit.statusCheckRollup && <Status state={data.commit.statusCheckRollup.state} />}
      <CommitLink commit={data.commit} />
    </div>
  );
}
