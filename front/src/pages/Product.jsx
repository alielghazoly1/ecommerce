import React from 'react';
import { useParams } from 'react-router-dom';
import { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import LazyImage from '../components/LazyImage';
const Product = () => {
  const { addToCart, all_products } = useContext(ShopContext);
  const { productId } = useParams();

  const product = all_products.find((p) => p._id === productId);

  const [selectedColor, setSelectedColor] = useState('Red');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <section
        className="min-h-screen flex items-center justify-center
      text-white bg-linear-to-r from-indigo-900 via-purple-900 to-pink-900"
      >
        <p className="text-2xl font-bold"> المنتج غير موجود</p>
      </section>
    );
  }
  const handleAddToCart = () => {
    addToCart(product._id, quantity);
    alert(`تم اضافة ${quantity} قطعة من ${product.name} الي السلة!`);
  };

  return (
    <section
      className="relative w-full min-h-screen bg-linear-to-r
    from-indigo-900 via-purple-900 to-pink-900 text-white py-24
    px-6 sm:px-10 flex items-center justify-center"
    >
      <div
        className="max-w-6xl max-auto bg-white/10 backdrop-blur-md rounded-3xl p-10
          flex flex-col md:flex-row gap-10 shadow-2xl"
      ></div>

      <div
        className=" md:w-1/2 flex items-center justify-center bg-white/5
      rounded-3xl p-6"
      >
        <LazyImage
          src={product.image}
          className="w-64 h-64 object-contain rounded-2xl"
          alt={product.name}
        />
      </div>
      <div className="flex-1 flex flex-col gap-6">
        <h2 className=" text-4xl font-extrabold">{product.name}</h2>
        <p className="text-gray-300 text-lg">{product.description}</p>
        <p className="text-cyan-400 text-3xl font-bold">${product.price}</p>
        <p className="text-gray-200 text-lg">Category: {product.category}</p>
        <div>
          <h4 className=' font-semibold mb-2'>Color:</h4>
          <div className='flex gap-4'>
            {["Red", "Blue", "Green", "Black", "White"]}
          </div>
        </div>
      </div>

    </section>
  );
};

export default Product;
