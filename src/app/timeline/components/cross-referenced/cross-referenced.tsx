import { CrossReferencedEvent } from '@octokit/graphql-schema';
import { CrossReferenceIcon } from '@primer/octicons-react';
import { Link } from '@tanstack/react-router';
import { Icon, IssueStatus, Avatar } from '@/app/components';
import { Card } from '@/components/ui/card';
import { User } from '@/components/user/user';

export function CrossReferenced({ data }: { data: CrossReferencedEvent }) {
  return (
    <div
      className="grid items-center gap-2"
      style={{
        gridTemplateAreas: `
          "icon description"
          ".    issue"
        `,
        gridTemplateColumns: 'min-content 1fr'
      }}>
      <Icon className="bg-accent text-muted-foreground"><CrossReferenceIcon /></Icon>
      <span><User actor={data.actor!} /> referenced this</span>
      <Card style={{ gridArea: 'issue' }}>
        <div className="flex gap-1 items-center">
          <div className="flex flex-col gap-1 flex-1">
            <Link to={data.source.url} target="_blank" className="truncate font-semibold outline-none hover:underline focus-visible:underline">{data.source.title}</Link>
            {data.isCrossRepository &&
              <div className="flex gap-1 items-center">
                <Avatar src={data.source.repository.owner.avatarUrl} />
                <Link to={data.source.url} target="_blank" className="text-gray-700 outline-none hover:underline focus-visible:underline">{data.source.repository.owner.login}/{data.source.repository.name} #{data.source.number}</Link>
              </div>
            }
            {!data.isCrossRepository && <Link to={data.source.url} target="_blank" className="text-gray-700 outline-none hover:underline focus-visible:underline">#{data.source.number}</Link>}
          </div>
          <IssueStatus data={data.source} />
        </div>
      </Card>
    </div>
  );
}
