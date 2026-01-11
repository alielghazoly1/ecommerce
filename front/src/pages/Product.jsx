import  { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';

const Product = () => {
  const { addToCart, all_products, url, token } = useContext(ShopContext);
  const { productId } = useParams();

  const product = all_products.find((p) => p._id === productId);

  const [selectedColor, setSelectedColor] = useState('Red');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-800">
        <p className="text-2xl font-bold">المنتج غير موجود</p>
      </section>
    );
  }

  const handleAddToCart = () => {
    addToCart(product._id,token, quantity);
    alert(`تم إضافة ${quantity} قطعة من ${product.name} إلى السلة!`);
  };

  return (
    <section className="relative w-full min-h-screen bg-gray-100 py-24 px-6 sm:px-10 flex items-center justify-center">
      <div className="max-w-6xl w-full bg-white rounded-3xl p-10 flex flex-col md:flex-row gap-10 shadow-xl hover:shadow-2xl transition-all">
        {/* Image */}
        <div className="md:w-1/2 flex items-center justify-center bg-gray-50 rounded-3xl p-6 shadow-inner">
          <LazyImage
            src={`${url}/images/${product.image}`}
            className="w-64 h-64 object-contain rounded-2xl"
            alt={product.name}
          />
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-4xl font-extrabold text-gray-800">{product.name}</h2>
          <p className="text-gray-600 text-lg">{product.description}</p>
          <p className="text-green-600 text-3xl font-bold">${product.price}</p>
          <p className="text-gray-500 text-lg">Category: {product.category}</p>

          {/* Color selector */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Color:</h4>
            <div className="flex gap-4">
              {['Red', 'Blue', 'Green', 'Black', 'White'].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 border-gray-300 transition-all ${
                    selectedColor === color ? 'scale-125 border-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                ></button>
              ))}
            </div>
          </div>

          {/* Size selector */}
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Size:</h4>
            <div className="flex gap-4">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-xl border-2 border-gray-300 transition-all ${
                    selectedSize === size ? 'bg-blue-500 text-white scale-105 shadow-lg' : ''
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <h4 className="text-gray-800 font-semibold">Quantity</h4>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="bg-gray-200 px-3 py-1 rounded-xl hover:bg-gray-300 transition-all"
            >
              -
            </button>
            <span className="px-3 text-gray-800 font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-gray-200 px-3 py-1 rounded-xl hover:bg-gray-300 transition-all"
            >
              +
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all mt-4"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
};

export default Product;
