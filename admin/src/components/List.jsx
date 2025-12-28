import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

import axios from 'axios';

const List = () => {
  const [products, setProducts] = useState([]);
  const url = import.meta.env.VITE_API_URL;

  const fetchProducts = async () => {
    const res = await axios.get(`${url}/api/product/list`);
    if (res.data.success) {
      setProducts(res.data.data);
    } else {
      console.log('error');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  const handleDelete = async (id) => {
    const res = await axios.post(`${url}/api/product/remove`, { id: id });
    await fetchProducts();
    if (res.data.success) {
      console.log('success');
    } else {
      console.log('error');
    }
  };
  return (
    <section
      className=" relative w-full md:ml-64 min-h-screen bg-linear-to-r
    from-indigo-900 via-purple-800 to-pink-900 text-white py-24 px-6
    sm:px-10"
    >
      <div className=" relative z-10 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">قائمة المنتجات</h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3
        lg:grid-cols-4 gap-8"
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 flex flex-col shadow-lg"
            >
              <img
                src={`${url}/images/${product.image}`}
                alt={product.name}
                className="w-full h-48 object-contain mb-4 rounded-xl"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-300 text-sm mb-2 truncate">
                {product.description}
              </p>
              <p className="text-cyan-400 font-bold mb-2">
                {product.price} EGP
              </p>
              <p className="text-gray-200 mb-4">{product.category}</p>
              <button
                onClick={() => handleDelete(product._id)}
                className="mt-3 flex items-center justify-center gap-2 bg-red-500/90 px-4 py-2 rounded-xl   text-white font-semibold shadow-md hover:bg-red-600 hover:scale-105 active:scale-95 transition-all duration-200"
                title="حذف المنتج"
              >
                <Trash2 size={18} />
                حذف
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default List;
