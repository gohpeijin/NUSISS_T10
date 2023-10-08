const ProductService = require("../services/product-service");
const UserAuth = require("./middlewares/auth");
const { RPCObserver, PublishMessage } = require("../utils");
//Using the below to handle image data
const multer = require("multer");
const storage = multer.memoryStorage(); // Use memory storage for file buffer
const upload = multer({
  storage: storage, // Use the 'storage' variable you defined
  dest: "./tmp",
});
module.exports = (app, channel) => {
  const service = new ProductService();

  // this will receive call by other service
  RPCObserver("PRODUCT_RPC", service); // this is the utils/index.js then will call to services to do smtg with data get =D

  // create product (seller)
  app.post(
    "/product/create",
    upload.array("imageData", 10),
    async (req, res) => {
      const {
        user_id,
        name,
        description,
        category_type,
        quantity,
        price,
        active,
      } = req.body;

      const imageDataArray = req.files; // Multer attaches an array of files to req.files
      // Process the uploaded files in imageDataArray
      const imageData = imageDataArray.map((file) => ({
        data: file.buffer,
        contentType: file.mimetype, // Use file.mimetype for the content type
      }));
      // validation
      const { data } = await service.CreateProduct({
        user_id,
        name,
        description,
        category_type,
        quantity,
        price,
        active,
        imageData, // Pass the buffer directly
      });
      return res.json(data);
    }
  );

  // (customer & seller)
  app.get("/category/:type", async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  // (customer & seller)
  app.get("/product/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error: "customize error mssg" });
    }
  });

  // list product per seller

  app.get("/product/user/:userid", UserAuth, async (req, res, next) => {
    //check validation
    try {
      const userId = req.params.userid;
      console.log({ userId });
      const { data } = await service.GetProductdByUserId(userId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  // get product by ids (customer & seller)
  app.get("/ids", async (req, res, next) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });

  //get all products (customer & seller)
  app.get("/", UserAuth, async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/product/get/dummy", async (req, res, next) => {
    //check validation
    try {
      return res.status(200).json("yay deploy success");
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};

  // add item to wishlist (customer)
  app.put("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user; // user_id

    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body._id }, // product_id
      "ADD_TO_WISHLIST"
    );

    // PublishCustomerEvent(data);
    PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));

    res.status(200).json(data.data.product);
  });

  app.delete("/wishlist/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_WISHLIST"
    );
    // PublishCustomerEvent(data);
    PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));

    res.status(200).json(data.data.product);
  });


  app.put("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    const { data } = await service.GetProductPayload(
      _id,
      { productId: req.body._id, qty: req.body.qty },
      "ADD_TO_CART"
    );

    // PublishCustomerEvent(data);
    // PublishShoppingEvent(data);

    PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
    PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));

    const response = { product: data.data.product, unit: data.data.qty };

    res.status(200).json(response);
  });

  app.delete("/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    const { data } = await service.GetProductPayload(
      _id,
      { productId },
      "REMOVE_FROM_CART"
    );

    // PublishCustomerEvent(data);
    // PublishShoppingEvent(data);

    PublishMessage(channel, CUSTOMER_SERVICE, JSON.stringify(data));
    PublishMessage(channel, SHOPPING_SERVICE, JSON.stringify(data));

    const response = { product: data.data.product, unit: data.data.qty };

    res.status(200).json(response);
  });
  
