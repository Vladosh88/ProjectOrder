import { useState } from 'react';

export default function FileGallery({ files, onRemove }) {
  const [lightbox, setLightbox] = useState(null);

  if (!files?.length) return null;

  const isVideo = (f) => ['mp4', 'mov', 'webm'].includes(f.format?.toLowerCase());

  return (
    <>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {files.map((file) => {
          const id = file.publicId || file.public_id;
          return (
            <div key={id} className="relative group">
              {isVideo(file) ? (
                <video
                  src={file.url}
                  className="w-full h-20 object-cover rounded-lg cursor-pointer"
                  onClick={() => setLightbox(file)}
                />
              ) : (
                <img
                  src={file.url}
                  alt=""
                  className="w-full h-20 object-cover rounded-lg cursor-pointer"
                  onClick={() => setLightbox(file)}
                />
              )}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {isVideo(lightbox) ? (
              <video src={lightbox.url} controls className="max-h-[85vh] rounded-lg" />
            ) : (
              <img src={lightbox.url} alt="" className="max-h-[85vh] rounded-lg" />
            )}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:opacity-80"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
