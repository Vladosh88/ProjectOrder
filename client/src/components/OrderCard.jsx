export default function OrderCard({ order, onClick, onDelete }) {
  const isOverdue = order.status === 0 && order.deadline && new Date(order.deadline) < new Date();
  const thumbnail = order.files?.[0];

  return (
    <div
      onClick={() => onClick(order.id)}
      className="bg-white dark:bg-gray-800 rounded-card shadow-sm hover:shadow-md p-4 cursor-pointer transition-all duration-200 animate-fadeIn border border-gray-100 dark:border-gray-700 group"
    >
      <div className="flex gap-3">
        {thumbnail && (
          <img
            src={thumbnail.url}
            alt=""
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm truncate">{order.title}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(order.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-opacity text-xs"
              title="Удалить"
            >
              🗑
            </button>
          </div>
          {order.code && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{order.code}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
            {order.price && <span>Товар: {parseFloat(order.price).toLocaleString('ru-RU')} ₽</span>}
            {order.workPrice && <span>Работа: {parseFloat(order.workPrice).toLocaleString('ru-RU')} ₽</span>}
            <span className={order.paid ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}>
              {order.paid ? 'Оплачено' : 'Неоплачено'}
            </span>
            {(order.startDate || order.deadline) && (
              <span className="flex items-center gap-1">
                {order.startDate && (
                  <span className="text-green-600 dark:text-green-400">
                    {new Date(order.startDate).toLocaleDateString('ru-RU')}
                  </span>
                )}
                {order.startDate && order.deadline && <span>—</span>}
                {order.deadline && (
                  <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                    {new Date(order.deadline).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </span>
            )}
          </div>
          {order.manager && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Менеджер: {order.manager}</p>
          )}
          {isOverdue && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
              Просрочен
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
