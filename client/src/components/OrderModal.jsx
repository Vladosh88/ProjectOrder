import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchOrder, updateOrder, deleteOrder, duplicateOrder } from '../api/orders';
import { useOrderStore } from '../store/orderStore';
import FileUploader from './FileUploader';
import FileGallery from './FileGallery';
import toast from 'react-hot-toast';

const schema = z.object({
  code: z.string().optional(),
  title: z.string().min(1, 'Название обязательно').max(255),
  description: z.string().optional(),
  price: z.string().optional(),
  deadline: z.string().optional(),
  status: z.string(),
});

export default function OrderModal({ orderId, onClose, onUpdated }) {
  const [order, setOrder] = useState(null);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { updateOrder: updateLocal, removeOrder, addOrder } = useOrderStore();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const price = watch('price');

  useEffect(() => {
    fetchOrder(orderId).then(({ data }) => {
      setOrder(data);
      setFiles(data.files || []);
      reset({
        code: data.code || '',
        title: data.title,
        description: data.description || '',
        price: data.price ? String(parseFloat(data.price)) : '',
        deadline: data.deadline ? data.deadline.slice(0, 16) : '',
        status: String(data.status),
      });
    }).catch(() => {
      toast.error('Заказ не найден');
      onClose();
    });
  }, [orderId, reset, onClose]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : null,
        deadline: data.deadline || null,
        status: parseInt(data.status),
        files: files.map((f) => ({ publicId: f.publicId || f.public_id, url: f.url, format: f.format, size: f.size })),
      };
      const { data: updated } = await updateOrder(orderId, payload);
      updateLocal(updated);
      toast.success('Заказ обновлён');
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка обновления');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить заказ?')) return;
    try {
      await deleteOrder(orderId);
      removeOrder(orderId);
      toast.success('Заказ удалён');
      onClose();
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const handleDuplicate = async () => {
    try {
      const { data: dup } = await duplicateOrder(orderId);
      addOrder(dup);
      toast.success('Заказ дублирован');
      onUpdated?.();
      onClose();
    } catch {
      toast.error('Ошибка дублирования');
    }
  };

  if (!order) return null;

  const priceNum = parseFloat(price) || 0;
  const priceWithTax = priceNum > 0 ? (priceNum * 1.04).toFixed(2) : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-card shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Заказ #{order.id}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Код заказа</label>
            <input {...register('code')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Название *</label>
            <input {...register('title')} className="input-field" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Описание</label>
            <textarea {...register('description')} className="input-field min-h-[80px] resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Стоимость (₽)</label>
              <input type="number" step="0.01" min="0" {...register('price')} className="input-field" />
              {priceWithTax && (
                <p className="text-xs text-gray-500 mt-1">+4%: {priceWithTax} ₽</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Срок выполнения</label>
              <input type="datetime-local" {...register('deadline')} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Статус</label>
            <select {...register('status')} className="input-field">
              <option value="0">В работе</option>
              <option value="1">Готово</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Файлы</label>
            <FileGallery files={files} onRemove={(publicId) => setFiles(files.filter((f) => (f.publicId || f.public_id) !== publicId))} />
            <FileUploader files={files} onChange={setFiles} />
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button type="button" onClick={handleDuplicate} className="btn-secondary">Дублировать</button>
            <button type="button" onClick={handleDelete} className="btn-danger">Удалить</button>
            <button type="button" onClick={onClose} className="btn-secondary ml-auto">Закрыть</button>
          </div>
        </form>
      </div>
    </div>
  );
}
