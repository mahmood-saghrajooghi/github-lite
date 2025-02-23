import { LoginPage } from '@/app/login/page';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
  component: App,
})


export default function App() {
  return (
    <>
      {localStorage.token ? (
          null
      ) : (
        <LoginPage />
      )}
     </>
  );
}
