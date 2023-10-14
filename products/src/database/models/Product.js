const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  // id auto generated no need declare
  user_id: {
    type: Schema.Types.ObjectId,
    required: [true, 'user id required'],
  },
  name: { type: String, required: [true, 'product name required'] },
  description: String,
  category_type: String,
  // imageData: { data: Buffer, contentType: String }, // Image data and MIME type (media type)
  imageData: String, // Array of image data and MIME types (media types)
  quantity: Number,
  price: Number,
  active: Boolean,
  // available: Boolean,
  // suplier: String
});

module.exports = mongoose.model('product', ProductSchema);

// Product
// product_id = string
// producer_Id = string --> i change to user id(seller id)
// name = string
// description = string
// category_type = string
// imageData = object[]
// 	type: Binary
// 	subtype: 0
// price = decimal
// quantity = integer
// active = boolean -->? this is seller put to unactive
// available = boolean -->? is active and available same? if 0 mean unavailable (redundent)

// remove
// imageName = string -->?
// supplier = string --> this one we need?
