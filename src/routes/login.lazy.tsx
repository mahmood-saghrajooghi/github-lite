import { LoginPage } from '@/app/login/page';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/login')({
  component: Login,
})

function Login() {
  return <LoginPage />;
}
