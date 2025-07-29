import { RenamedTitleEvent } from '@/generated/graphql';
import { PencilIcon } from '@primer/octicons-react';
import { Icon } from '@/app/components';
import { User } from '@/components/user/user';


export function Renamed({ data }: { data: RenamedTitleEvent }) {
  return (
    <div className="flex gap-2">
      <Icon className="bg-accent text-muted-foreground"><PencilIcon /></Icon>
      <span className="text-muted-foreground mt-1"><User actor={data.actor!} /> changed the title from <del>{data.previousTitle}</del> to <ins>{data.currentTitle}</ins></span>
    </div>
  );
}
