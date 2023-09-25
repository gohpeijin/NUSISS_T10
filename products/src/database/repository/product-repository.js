const { ProductModel } = require("../models");

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
    const imageDocuments = imageData.map((image) => {
      return {
        data: image.data, // The image buffer
        contentType: image.contentType, // The MIME type of the image
      };
    });

    const product = new ProductModel({
      user_id: "your_user_id", // TODO: manually assign data becuz is empty, You should set this to the actual user_id
      name,
      description,
      category_type,
      imageData: imageDocuments, // Assign the array of image documents
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
      .where("_id")
      .in(selectedIds.map((_id) => _id))
      .exec();
    return products;
  }
}

module.exports = ProductRepository;
