import { RestEndpointMethodTypes } from '@octokit/rest';
import { github } from '@/lib/client';
import { PullRequestPage } from '@/app/PullRequest';
import { LoginPage } from '@/app/login/page';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { mutate } from 'swr';
import { useEffect, useRef } from 'react';

type PullRequest = RestEndpointMethodTypes["search"]["issuesAndPullRequests"]["response"]["data"]["items"][0];

export const Route = createLazyFileRoute('/')({
  component: App,
})


export default function App() {
  return (
    <>
      {localStorage.token ? (
          <Notifications />
      ) : (
        <LoginPage />
      )}
     </>
  );
}


function Notifications() {
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <div className="flex flex-1">
    </div>
  );
}

function markAsRead(id: string) {
  mutate('notifications', async (notifications?: Notification[]) => {
    await github.activity.markThreadAsRead({ thread_id: Number(id) });
    if (notifications) {
      let index = notifications.findIndex(n => n.id === id);
      let result = [...notifications];
      result[index] = { ...result[index], unread: false };
      return result;
    }
    return notifications;
  });
}
