import mongoose from 'mongoose';
import { ORDER_STATUS, ORDER_STATUSES } from '@forever/shared';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Each item carries a server-priced `price` in integer cents.
  items: { type: [], required: true },
  // The server-priced total in integer cents, delivery included (ADR-0002).
  amount: { type: Number, required: true },
  // 1 = `amount` and item prices are cents. Missing/0 = the legacy dollars
  // written before server pricing; the shared order helpers read both.
  pricingVersion: { type: Number },
  address: { type: Object, required: true },
  orderStatus: {
    type: String,
    enum: ORDER_STATUSES,
    required: true,
    default: ORDER_STATUS.PLACED,
  },
  paymentMethod: { type: String, required: true },
  payment: { type: Boolean, required: true, default: false },
  date: { type: Number, required: true },
});

const orderModel =
  mongoose.models.order || mongoose.model('Order', orderSchema);

export default orderModel;
