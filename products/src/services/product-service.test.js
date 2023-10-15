const ProductService = require("../services/product-service");
const mongoose = require("mongoose");
const {
  sampleUpdateProductInputs,
  sampleProductInputs,
} = require("./sample-product-data");

describe("ProductService Tests", () => {
  let product_id;
  const productService = new ProductService();
  beforeAll(async () => {
    // Connect to an in-memory MongoDB database or use a test database
    await mongoose.connect("mongodb://localhost:27017/ms_product", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("should create a product", async () => {
    // Define your input data for creating a product
    const productInputs = { ...sampleProductInputs };

    //Create product
    const createProductResult = await productService.CreateProduct(
      productInputs
    );
    //Find Created Product
    const searchCreateProductResult =
      await productService.GetProductDescription(
        createProductResult.data._id.toString()
      );
    // Created product exist in database
    expect(searchCreateProductResult).toBeDefined();

    // Checking every property
    expect(searchCreateProductResult.data.quantity).toEqual(
      productInputs.quantity
    );
    expect(searchCreateProductResult.data.price).toEqual(productInputs.price);
    expect(searchCreateProductResult.data.active).toEqual(productInputs.active);
    expect(searchCreateProductResult.data.imageData).toEqual(
      productInputs.imageData
    );
    expect(searchCreateProductResult.data.category_type).toEqual(
      productInputs.category_type
    );
    expect(searchCreateProductResult.data.description).toEqual(
      productInputs.description
    );
    expect(searchCreateProductResult.data.name).toEqual(productInputs.name);
    expect(searchCreateProductResult.data.user_id.toString()).toEqual(
      productInputs.user_id
    );

    // get the product id and assign it globally
    product_id = searchCreateProductResult.data._id.toString();
  });

  it("should update a product name and description", async () => {
    // Define your input data for creating a product
    const updateProductInputs = { ...sampleUpdateProductInputs };

    //Update product
    const updatedResult = await productService.EditProduct(
      product_id,
      updateProductInputs
    );

    //Find Updated Product
    const searchUpdatedResult = await productService.GetProductDescription(
      product_id
    );

    // Created product exist in database
    expect(searchUpdatedResult).toBeDefined();

    // Checking for updated property
    expect(searchUpdatedResult.data.description).toEqual(
      updateProductInputs.description
    );
    expect(searchUpdatedResult.data.name).toEqual(updateProductInputs.name);

    // Update product with unavailable id
    const false_id = "999999999999999999999999";
    // specify the error message or error class you expect to be thrown:
    try {
      await productService.EditProduct(false_id, updateProductInputs);
      fail("Expected an error to be thrown");
    } catch (error) {
      expect(error.message).toBe(
        "Product is not found for given id: " + false_id
      );
    }
  });

  it("should delete a product", async () => {
    if (!product_id) {
      throw new Error("No product ID available for deletion");
    }
    const products = await productService.GetProducts();
    let startCount = products.data.products.length;
    const deleting = await productService.DeleteProduct(product_id);
    const products1 = await productService.GetProducts();
    let endCount = products1.data.products.length;
    expect(startCount - 1).toEqual(endCount);
    const searchResult = await productService.GetProductDescription(product_id);
    expect(searchResult.data.error).toEqual("The product is unavialable");
  });
});
