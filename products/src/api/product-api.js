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
  RPCObserver("PRODUCT_RPC", service); // serve RPC Request
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
  app.get("/product/category/:type", async (req, res, next) => {
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
  app.get("/product/ids", async (req, res, next) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });

  //get all products (customer & seller)
  app.get("/product/", UserAuth, async (req, res, next) => {
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

 

