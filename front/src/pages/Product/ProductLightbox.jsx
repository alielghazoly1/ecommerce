import { X } from 'lucide-react';

const ProductLightbox = ({ isOpen, onClose, image, name }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-6xl w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center min-h-[70vh]">
          <img
            src={image}
            alt={name}
            className="max-h-[85vh] max-w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductLightbox;