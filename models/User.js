const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfCreation: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  deliveryAddress: {
    type: [String],
  },
  country: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  accountType: {
    type: String,
    required: true,
  },
  refreshTokens: {
    type: [String],
    unique: true,
  },
});

module.exports = mongoose.model('User', userSchema);
