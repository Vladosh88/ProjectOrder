import { useEffect, useState, useCallback } from 'react';
import { useOrderStore } from '../store/orderStore';
import { fetchOrders } from '../api/orders';
import KanbanBoard from '../components/KanbanBoard';
import MobileList from '../components/MobileList';
import SearchBar from '../components/SearchBar';
import Header from '../components/Header';
import CreateOrderModal from '../components/CreateOrderModal';
import OrderModal from '../components/OrderModal';
import toast from 'react-hot-toast';

export default function KanbanPage() {
  const { orders, total, filters, setOrders, appendOrders, setLoading } = useOrderStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const loadOrders = useCallback(async (offset = 0) => {
    setLoading(true);
    try {
      const { data } = await fetchOrders({ ...filters, offset, limit: 20 });
      if (offset === 0) {
        setOrders(data.orders, data.total);
      } else {
        appendOrders(data.orders, data.total);
      }

      if (offset === 0) {
        const overdue = data.orders.filter(
          (o) => o.status === 0 && o.deadline && new Date(o.deadline) < new Date()
        );
        if (overdue.length > 0) {
          toast('Есть просроченные заказы', { icon: '⚠️' });
        }
      }
    } catch {
      toast.error('Ошибка загрузки заказов');
    } finally {
      setLoading(false);
    }
  }, [filters, setOrders, appendOrders, setLoading]);

  useEffect(() => {
    loadOrders(0);
  }, [loadOrders]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLoadMore = () => {
    loadOrders(orders.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <Header onCreateClick={() => setShowCreate(true)} />
      <SearchBar />
      {isMobile ? (
        <MobileList
          orders={orders}
          total={total}
          onCardClick={setSelectedOrderId}
          onLoadMore={handleLoadMore}
        />
      ) : (
        <KanbanBoard
          orders={orders}
          total={total}
          onCardClick={setSelectedOrderId}
          onLoadMore={handleLoadMore}
        />
      )}
      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} onCreated={() => loadOrders(0)} />}
      {selectedOrderId && (
        <OrderModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onUpdated={() => loadOrders(0)}
        />
      )}
    </div>
  );
}
