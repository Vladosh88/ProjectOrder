import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import KanbanPage from './pages/KanbanPage';
import ThemeToggle from './components/ThemeToggle';

export default function App() {
  const token = useAuthStore((s) => s.token);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster position="top-right" />
      {token ? <KanbanPage /> : <LoginPage />}
    </div>
  );
}
