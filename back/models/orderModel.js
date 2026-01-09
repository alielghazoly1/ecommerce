import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // 👈 مهم جداً
    ref: 'User',                           // 👈 لازم يكون اسم الموديل
    required: true,
  },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: {
    type: String,
    enum: ['pending', 'on the way', 'delivered'],
    default: 'pending',
  },
  date: { type: Date, default: Date.now }, // 👈 خليها Date مش String
  payment: { type: Boolean, default: false },
});

const orderModel =
  mongoose.models.order || mongoose.model('Order', orderSchema);

export default orderModel;
