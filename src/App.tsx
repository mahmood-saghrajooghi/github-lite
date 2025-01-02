import useSWR from 'swr';
import { RestEndpointMethodTypes } from '@octokit/rest';
import { github, preload } from './lib/client';
import { PullRequestPage } from './app/PullRequest';
import { IssuePage } from './app/Issue';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { mutate } from 'swr';
import { useEffect } from 'react';
import { Button } from './components/ui/button';
import { ThemeProvider } from './components/theme-provider';

type Notification = RestEndpointMethodTypes["activity"]["listNotificationsForAuthenticatedUser"]["response"]["data"][0];

async function fetchNotifications() {
  try {
    const res = await github.activity.listNotificationsForAuthenticatedUser({
      page: 1,
      all: true,
      headers: {
        'If-None-Match': ''
      }
    });

    for (const item of res.data.slice(0, 10)) {
      preloadNotification(item);
    }

    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export default function App() {
  if (!localStorage.token) {
    return <Login />;
  }

  return (
    <ThemeProvider>
      <Notifications />
    </ThemeProvider>
  );
}

function Login() {
  return <h1>Login</h1>
}

function Notifications() {
  const { data } = useSWR('notifications', fetchNotifications);
  const { pathname } = useLocation();

  return (
    <div className="flex h-full">
      <div className="w-[280px] border-r border-daw-gray-300 overflow-hidden">
        <div
          aria-label="Notifications"
          className="h-full max-h-[100vh] overflow-auto p-2 flex flex-col gap-1">
          {data?.map(item => <NotificationItem item={item} />)}
        </div>
      </div>
      <Routes>
        <Route path="/*" element={<Notification selectedItem={data?.find(d => d.id === pathname.slice(1))} />} />
      </Routes>
    </div>
  );
}

function NotificationItem({ item }: { item: Notification }) {
  return (
    <Button asChild >
      <Link
        id={`/${item.id}`}
        to={`/${item.id}`}
        className="group grid grid-cols-[auto_1fr] gap-y-1 gap-x-3 items-baseline rounded-md cursor-default px-3 py-2 hover:bg-daw-gray-200 selected:bg-daw-gray-900 hover:aria-selected:bg-daw-gray-900 selected:text-daw-white outline-none focus-visible]:outline-black outline-offset-2"
        onMouseOver={() => {
          preloadNotification(item);
        }}>
        <>
          <div className="col-start-1 w-[10px] h-[10px]">{item.unread ? <div aria-label="Unread" role="status" className="rounded-full bg-blue-500 w-full h-full" /> : null}</div>
          <div className="col-start-2 text-sm font-medium line-clamp-2">{item.subject.title}</div>
          <div className="text-xs col-start-2 text-daw-gray-600 group-aria-selected:text-daw-gray-300 truncate">{item.repository.full_name} #{item.subject.url?.split('/').pop()}</div>
        </>
      </Link>
    </Button>
  );
}

function preloadNotification(item: Notification) {
  switch (item?.subject.type) {
    case 'PullRequest':
      preload(PullRequestPage.query(), { owner: item.repository.owner.login, repo: item.repository.name, number: Number(item.subject.url.split('/').pop()) });
      break;
    case 'Issue':
      preload(IssuePage.query(), { owner: item.repository.owner.login, repo: item.repository.name, number: Number(item.subject.url.split('/').pop()) });
      break;
  }
}

function Notification({ selectedItem }: { selectedItem: Notification | undefined }) {
  let content;
  switch (selectedItem?.subject.type) {
    case 'PullRequest':
      content = <PullRequestPage key={selectedItem.id} owner={selectedItem.repository.owner.login} repo={selectedItem.repository.name} number={Number(selectedItem.subject.url.split('/').pop())} />;
      break;
    case 'Issue':
      content = <IssuePage key={selectedItem.id} owner={selectedItem.repository.owner.login} repo={selectedItem.repository.name} number={Number(selectedItem.subject.url.split('/').pop())} />;
      break;
    default:
      content = (
        <div className="flex items-center justify-center h-full text-lg text-gray-700 font-semibold">
          {selectedItem ? `Unknown item type: ${selectedItem.subject.type}` : 'No notification selected.'}
        </div>
      );
      break;
  }

  useEffect(() => {
    if (selectedItem?.unread) {
      markAsRead(selectedItem.id);
    }
  }, [selectedItem]);

  return (
    <div className="flex-1 overflow-auto" key={selectedItem?.id}>
      {content}
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
