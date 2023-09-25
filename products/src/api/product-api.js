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

  app.get("/category/:type", async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error });
    }
  });

  app.get("/product/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (error) {
      return res.status(404).json({ error: "customize error mssg" });
    }
  });

  app.get("/product/user/:userid", async (req, res, next) => {
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

  app.post("/ids", async (req, res, next) => {
    const { ids } = req.body;
    const products = await service.GetSelectedProducts(ids);
    return res.status(200).json(products);
  });

  //get Top products and category
  app.get("/", async (req, res, next) => {
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

  // app.get("/publishDataToOthers", async (req, res, next) => {
  //   try {
  //     const { user_id } = req.body;
  //     const { data } = await service.GetProductPayload(
  //       user_id,
  //       { productId: req.body._id, qty: req.body.qty },
  //       "ADD_TO_CART_EVENT_OR_OTHER_EVENT_NAME"
  //     );
  //     // this is pass to customer
  //     PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(data));
  //     return "yay deploy success";
  //   } catch (error) {
  //     return res.status(404).json({ error });
  //   }
  // });
};
