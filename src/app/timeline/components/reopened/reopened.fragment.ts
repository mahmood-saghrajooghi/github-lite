import { ActorFragment } from '@/components/user/user.fragment'
export const ReopenedEventFragment = /* GraphQL */ `
  fragment ReopenedEventFragment on ReopenedEvent {
    id
    actor {
      ...ActorFragment
    }
  }

  ${ActorFragment}
`;
