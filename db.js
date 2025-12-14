
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const OrderSchema = new mongoose.Schema({
  code: String, userId: Number, chatId: Number, carrier: String,
  status: String, lastMsg: String, timeline: Array, notify: { type: Boolean, default: true }
});
const AdminSchema = new mongoose.Schema({
  username: String, password: String, role: String
});
module.exports = {
  Order: mongoose.model('Order', OrderSchema),
  Admin: mongoose.model('Admin', AdminSchema)
};
