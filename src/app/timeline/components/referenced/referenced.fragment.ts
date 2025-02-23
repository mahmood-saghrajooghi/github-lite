import { ActorFragment } from '@/components/user/user.fragment';

export const ReferencedEventFragment = /* GraphQL */ `
  fragment ReferencedEventFragment on ReferencedEvent {
    id
    actor {
      ...ActorFragment
    }
    isCrossRepository
    commit {
      url
      abbreviatedOid
      message
      commitUrl
      author {
        user {
          login
        }
        avatarUrl
      }
      statusCheckRollup {
        state
      }
    }
  }

  ${ActorFragment}
`;
