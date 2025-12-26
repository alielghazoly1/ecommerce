const Add = () => {
  return (
    <section
      className="relative w-full min-h-screen bg-gradient-to-r
      from-indigo-900 via-purple-900 to-pink-900 text-white
      py-24 px-6 sm:px-10"
    >
      <form onSubmit={onSubmitHandler}>
        <div
          className="relative z-10 max-w-3xl mx-auto bg-white/10 backdrop-blur-md
          p-10 rounded-3xl shadow-xl"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">
            إضافة منتج جديد
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="اسم المنتج"
              value={data.name}
              onChange={onChangeHandler}
              className="w-full px-4 py-3 rounded-xl bg-white/15 text-white
                placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <input
              type="text"
              name="description"
              placeholder="وصف المنتج"
              value={data.description}
              onChange={onChangeHandler}
              className="w-full px-4 py-3 rounded-xl bg-white/15 text-white
                placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <input
              type="number"
              name="price"
              placeholder="السعر"
              value={data.price}
              onChange={onChangeHandler}
              className="w-full px-4 py-3 rounded-xl bg-white/15 text-white
                placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
            <select
              name="category"
              value={data.category}
              onChange={onChangeHandler}
              className="w-full px-4 py-3 rounded-xl bg-white/15 text-white
                placeholder-gray-300 focus:ring-2 focus:ring-cyan-400 outline-none"
            >
              <option>Men</option>
              <option>Women</option>
              <option>Kids</option>
              <option>Electronics</option>
              <option>Cosmetics</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={onChangeHandler}
              className="w-full text-white"
            />
            Add Image
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="image"
                className="w-full h-64 object-cover rounded-2xl mt-2"
              />
            )}
            <button
              type="submit"
              className="w-full bg-linear-to-r
            from-indigo-500 via-purple-500 to-pink-500 px-6
            py-3 rounded-2xl font-semibold hover:opacity-90 transition-all
             text-white shadow-lg mt-4"
            >
              اضافة منتج
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Add;
