import { ActorFragment } from '@/components/user/user.fragment';

export const RenamedTitleFragment = /* GraphQL */ `
  fragment RenamedTitleFragment on RenamedTitleEvent {
    id
    actor {
      ...ActorFragment
    }
    previousTitle
    currentTitle
  }

  ${ActorFragment}
`;
