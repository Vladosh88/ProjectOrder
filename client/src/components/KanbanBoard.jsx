import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core';
import { useOrderStore } from '../store/orderStore';
import { updateOrder, deleteOrder } from '../api/orders';
import OrderCard from './OrderCard';
import toast from 'react-hot-toast';

export default function KanbanBoard({ orders, total, onCardClick, onLoadMore }) {
  const { updateOrder: updateLocal, removeOrder } = useOrderStore();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const inProgress = orders.filter((o) => o.status === 0);
  const done = orders.filter((o) => o.status === 1);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const orderId = parseInt(active.id);
    const targetStatus = over.id === 'done' ? 1 : 0;
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === targetStatus) return;

    updateLocal({ ...order, status: targetStatus });
    try {
      await updateOrder(orderId, { status: targetStatus });
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
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-6">
        <Column id="in-progress" title="В работе" count={inProgress.length} orders={inProgress} onCardClick={onCardClick} onDelete={handleDelete} />
        <Column id="done" title="Готово" count={done.length} orders={done} onCardClick={onCardClick} onDelete={handleDelete} />
      </div>
      {orders.length < total && (
        <div className="text-center mt-6">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Загрузить ещё
          </button>
        </div>
      )}
    </DndContext>
  );
}

function Column({ id, title, count, orders, onCardClick, onDelete }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 dark:bg-gray-800/50 rounded-card p-4 min-h-[400px] transition-colors ${isOver ? 'ring-2 ring-accent/50' : ''}`}
    >
      <h2 className="font-semibold mb-4 text-sm flex items-center gap-2">
        {title}
        <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-xs">{count}</span>
      </h2>
      <div className="space-y-3">
        {orders.map((order) => (
          <DraggableCard key={order.id} order={order} onCardClick={onCardClick} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function DraggableCard({ order, onCardClick, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: String(order.id) });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.7 : 1 }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <OrderCard order={order} onClick={onCardClick} onDelete={onDelete} />
    </div>
  );
}
