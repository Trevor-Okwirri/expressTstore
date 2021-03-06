const mongoose = require('mongoose');
const { Schema } = mongoose;
let itemSchema = new Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity can not be less than 1.'],
    },
    price: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
const cartSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [itemSchema],
    subTotal: {
      default: 0,
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', cartSchema);
