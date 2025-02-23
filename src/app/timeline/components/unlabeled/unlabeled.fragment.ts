import { ActorFragment } from '@/components/user/user.fragment';

export const UnlabeledEventFragment = /* GraphQL */ `
  fragment UnlabeledEventFragment on UnlabeledEvent {
    id
    actor {
      ...ActorFragment
    }
    label {
      name
      color
    }
  }

  ${ActorFragment}
`;
