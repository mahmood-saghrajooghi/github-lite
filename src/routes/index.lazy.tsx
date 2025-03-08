import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { NotificationsList } from '@/components/notifications-list';

export const Route = createLazyFileRoute('/')({
  component: App,
})

export default function App() {
  // Check if token exists in localStorage
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');

  // If no token, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">GitHub Lite Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          Home page
        </div>
        <div>
          {/* Other dashboard widgets can go here */}
        </div>
      </div>
    </div>
  );
}
