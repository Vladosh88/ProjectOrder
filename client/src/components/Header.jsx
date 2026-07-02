import { useAuthStore } from '../store/authStore';
import { exportCsv } from '../api/orders';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export default function Header({ onCreateClick }) {
  const logout = useAuthStore((s) => s.logout);

  const handleExport = async () => {
    try {
      await exportCsv();
      toast.success('CSV скачан');
    } catch {
      toast.error('Ошибка экспорта');
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 className="text-2xl font-bold">Фото-отзывы WB</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={onCreateClick}
          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors text-sm"
        >
          + Создать заказ
        </button>
        <button
          onClick={handleExport}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          CSV
        </button>
        <ThemeToggle />
        <button
          onClick={logout}
          className="px-3 py-2 text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          Выход
        </button>
      </div>
    </header>
  );
}
