import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createOrder, getUploadSignature } from '../api/orders';
import { useOrderStore } from '../store/orderStore';
import FileUploader from './FileUploader';
import toast from 'react-hot-toast';

const schema = z.object({
  code: z.string().optional(),
  title: z.string().min(1, 'Название обязательно').max(255),
  description: z.string().optional(),
  price: z.string().optional(),
  deadline: z.string().optional(),
});

export default function CreateOrderModal({ onClose, onCreated }) {
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const addOrder = useOrderStore((s) => s.addOrder);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        ...data,
        price: data.price ? parseFloat(data.price) : null,
        deadline: data.deadline || null,
        files: files.map((f) => ({ publicId: f.publicId, url: f.url, format: f.format, size: f.size })),
      };
      const { data: order } = await createOrder(payload);
      addOrder(order);
      toast.success('Заказ создан');
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка создания');
    } finally {
      setSubmitting(false);
    }
  };

  const price = parseFloat(document.querySelector('[name="price"]')?.value || '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-card shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Новый заказ</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Код заказа</label>
            <input {...register('code')} className="input-field" placeholder="Необязательно" />
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Срок выполнения</label>
              <input type="datetime-local" {...register('deadline')} className="input-field" />
            </div>
          </div>
          <PriceWithTax register={register} />
          <div>
            <label className="block text-sm font-medium mb-2">Файлы</label>
            <FileUploader files={files} onChange={setFiles} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PriceWithTax({ register }) {
  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      Стоимость +4% (налог) рассчитывается автоматически при просмотре
    </div>
  );
}
