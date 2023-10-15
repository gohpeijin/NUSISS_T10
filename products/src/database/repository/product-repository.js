const { ProductModel } = require('../models');

class ProductRepository {
  async CreateProduct({
    user_id,
    name,
    description,
    category_type,
    imageData,
    quantity,
    price,
    active,
  }) {
    // const imageDocuments = imageData.map((image) => {
    //   return {
    //     data: image.data, // The image buffer
    //     contentType: image.contentType, // The MIME type of the image
    //   };
    // });

    const product = new ProductModel({
      user_id,
      name,
      description,
      category_type,
      imageData,
      quantity,
      price,
      active,
    });

    const productResult = await product.save();
    return productResult;
  }

  async Products() {
    return await ProductModel.find();
  }

  async FindById(id) {
    return await ProductModel.findById(id);
  }

  async FindByCategory(category) {
    const products = await ProductModel.find({ category_type: category });

    return products;
  }

  async FindByUserId(userId) {
    const products = await ProductModel.find({ user_id: userId });
    return products;
  }

  async FindSelectedProducts(selectedIds) {
    const products = await ProductModel.find()
      .where('_id')
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }

  async DeleteProductById(id) {
    return ProductModel.findByIdAndDelete(id);
  }

  async reduceProductQtyFromOrder(orderArray) {
    const productArray = [];

    for (const order of orderArray) {
      try {
        const product = await ProductModel.findById(order.product._id); // Assuming order.product is an object containing the product _id
        if (product) {
          product.quantity -= order.unit;
          await product.save();
          productArray.push(product);
        } else {
          // Handle the case where the product is not found
          console.error(`Product with ID ${order.product._id} not found.`);
        }
      } catch (error) {
        // Handle errors that occur during database operations
        console.error('Error updating product quantity:', error);
      }
    }

    return productArray;
  }

  async ToggleProductActiveState(productId) {
    try {
      const product = await ProductModel.findById(productId); // Assuming order.product is an object containing the product _id
      if (product) {
        product.active = !product.active;
        await product.save();
        return product;
      } else {
        // Handle the case where the product is not found
        console.error(`Product with ID ${order.product._id} not found.`);
        return null
      }
    } catch (error) {
      // Handle errors that occur during database operations
      console.error('Error updating product quantity:', error);
    }
  }
}

module.exports = ProductRepository;
