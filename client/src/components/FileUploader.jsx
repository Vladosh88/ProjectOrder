import { useState } from 'react';
import { getUploadSignature } from '../api/orders';
import toast from 'react-hot-toast';

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
const MAX_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 20;

export default function FileUploader({ files, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const selected = Array.from(e.target.files);
    e.target.value = '';

    if (files.length + selected.length > MAX_FILES) {
      toast.error(`Максимум ${MAX_FILES} файлов`);
      return;
    }

    const invalid = selected.filter((f) => !ALLOWED_FORMATS.includes(f.type) || f.size > MAX_SIZE);
    if (invalid.length) {
      toast.error('Некоторые файлы не подходят (формат или размер > 50МБ)');
      return;
    }

    setUploading(true);
    try {
      const { data: sig } = await getUploadSignature();
      const uploaded = [];

      for (const file of selected) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', sig.apiKey);
        formData.append('timestamp', sig.timestamp);
        formData.append('signature', sig.signature);
        formData.append('folder', sig.folder);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (data.error) {
          toast.error(`Ошибка загрузки: ${file.name}`);
          continue;
        }

        uploaded.push({
          publicId: data.public_id,
          url: data.secure_url,
          format: data.format,
          size: data.bytes,
        });
      }

      onChange([...files, ...uploaded]);
      if (uploaded.length) toast.success(`Загружено: ${uploaded.length}`);
    } catch {
      toast.error('Ошибка подключения к хранилищу');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="inline-block px-3 py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-accent transition-colors text-sm">
        {uploading ? 'Загрузка...' : '+ Добавить файлы'}
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.mp4,.mov"
          onChange={handleFiles}
          disabled={uploading}
          className="hidden"
        />
      </label>
      {files.length > 0 && (
        <p className="text-xs text-gray-500 mt-1">Загружено: {files.length}</p>
      )}
    </div>
  );
}
