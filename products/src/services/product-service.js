/** @format */

const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");

class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }
  async CreateProduct(productInputs) {
    const productResult = await this.repository.CreateProduct(productInputs);
    return FormateData(productResult);
  }

  async GetProducts() {
    const products = await this.repository.Products();

    let categories = {};

    products.map(({ category_type }) => {
      categories[category_type] = category_type;
      console.log(category_type);
    });

    return FormateData({
      products,
      categories: Object.keys(categories),
    });
  }

  async GetProductDescription(productId) {
    const product = await this.repository.FindById(productId);
    return FormateData(product);
  }

  async GetProductsByCategory(category) {
    const products = await this.repository.FindByCategory(category);
    return FormateData(products);
  }

  async GetProductdByUserId(userid) {
    const products = await this.repository.FindByUserId(userid);

    let categories = {};

    products.map(({ category_type }) => {
      categories[category_type] = category_type;
      console.log(category_type);
    });

    return FormateData({
      products,
      categories: Object.keys(categories),
    });

    // const products = await this.repository.FindByUserId(userid);
    // return FormateData(products);
  }

  async GetSelectedProducts(selectedIds) {
    const products = await this.repository.FindSelectedProducts(selectedIds);
    return FormateData(products);
  }

  async DeleteProduct(productId) {
    const data = await this.repository.DeleteProductById(productId);
    return { data };
  }

  async GetProductPayload(userId, { productId, qty }, event) {
    const product = await this.repository.FindById(productId);

    if (product) {
      const payload = {
        event: event,
        data: { userId, product, qty },
      };

      return FormateData(payload);
    } else {
      return FormateData({ error: "No product Available" });
    }
  }

  async reduceProductQtyFromOrder(orderArray) {
    return this.repository.reduceProductQtyFromOrder(orderArray);
  }

  async ToggleProductActiveState(productId){
    return this.repository.ToggleProductActiveState(productId);
  }

  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);
    const { event, data } = payload;
    switch (event) {
      case 'REDUCE_PRODUCT_QTY':
        await this.reduceProductQtyFromOrder(data.orderArray);
        break;
      default:
        break;
    }
  }

  // RPC Response
  //subscribe mssg at here with event nas,e
  // ANCHOR[id=product-service-serveRPCRequest]
  async serveRPCRequest(payload) {
    const { type, data } = payload;
    switch (type) {
      case "GET_ONE_PRODUCT":
        return this.repository.FindById(data);
        break;
      case "GET_ALL_PRODUCTS":
        return this.repository.FindSelectedProducts(data);
      default:
        break;
    }
  }
}

module.exports = ProductService;
