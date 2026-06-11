import { updateOrder, deleteOrder } from '../api/orders';
import { useOrderStore } from '../store/orderStore';
import OrderCard from './OrderCard';
import toast from 'react-hot-toast';

export default function MobileList({ orders, total, onCardClick, onLoadMore }) {
  const { updateOrder: updateLocal, removeOrder } = useOrderStore();

  const handleStatusChange = async (order, newStatus) => {
    updateLocal({ ...order, status: newStatus });
    try {
      await updateOrder(order.id, { status: newStatus });
    } catch {
      updateLocal(order);
      toast.error('Ошибка смены статуса');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить заказ?')) return;
    try {
      await deleteOrder(id);
      removeOrder(id);
      toast.success('Заказ удалён');
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="relative">
          <OrderCard order={order} onClick={onCardClick} onDelete={handleDelete} />
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order, parseInt(e.target.value))}
            className="absolute top-2 right-2 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <option value={0}>В работе</option>
            <option value={1}>Готово</option>
          </select>
        </div>
      ))}
      {orders.length < total && (
        <button
          onClick={onLoadMore}
          className="w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Загрузить ещё
        </button>
      )}
    </div>
  );
}
