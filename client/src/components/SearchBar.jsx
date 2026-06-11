import { useOrderStore } from '../store/orderStore';

export default function SearchBar() {
  const { filters, setFilters } = useOrderStore();

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        placeholder="Поиск по названию или коду..."
        value={filters.search}
        onChange={(e) => setFilters({ search: e.target.value })}
        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-accent text-sm"
      />
      <select
        value={filters.status}
        onChange={(e) => setFilters({ status: e.target.value })}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <option value="">Все</option>
        <option value="0">В работе</option>
        <option value="1">Готово</option>
      </select>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={filters.overdue}
          onChange={(e) => setFilters({ overdue: e.target.checked })}
          className="accent-accent"
        />
        Просроченные
      </label>
    </div>
  );
}
