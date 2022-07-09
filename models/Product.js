const mongoose = require('mongoose');
const { Schema } = mongoose;
let productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    imagesUrl: [
      {
        type: String,
      },
    ],
    category: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    seller: {
      type: String,
      required: true,
    },
    dateAdded: {
      type: Date,
      default: Date.now(),
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
