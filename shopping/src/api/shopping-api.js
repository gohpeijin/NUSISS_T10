const ShoppingService = require("../services/shopping-service");
const { SubscribeMessage } = require("../utils");
const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new ShoppingService();

  SubscribeMessage(channel, service);

  // Cart
  app.post("/shopping/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { product_id, qty } = req.body;
    const { data } = await service.AddCartItem(_id, product_id, qty);
    res.status(200).json(data);
  });

  app.delete("/shopping/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;
    const { data } = await service.RemoveCartItem(_id, productId);
    res.status(200).json(data);
  });

  app.get("/shopping/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const data = await service.GetCart(_id);
    return res.status(200).json(data);
  });

  // Wishlist
  app.post("/shopping/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { product_id } = req.body;
    const data = await service.AddToWishlist(_id, product_id);
    return res.status(200).json(data);
  });
  app.get("/shopping/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const data = await service.GetWishlist(_id);
    return res.status(200).json(data);
  });
  app.delete("/shopping/wishlist/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const product_id = req.params.id;
    const data = await service.RemoveFromWishlist(_id, product_id);
    return res.status(200).json(data);
  });

  // Orders
  app.post("/shopping/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;
    const data = await service.CreateOrder(_id, txnNumber);
    return res.status(200).json(data);
  });

  app.get("/shopping/order/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const data = await service.GetOrder(_id);
    return res.status(200).json(data);
  });

  app.get("/shopping/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const data = await service.GetOrders(_id);
    return res.status(200).json(data);
  });

  app.get("/shopping/whoami", (req, res, next) => {
    return res.status(200).json({ msg: "/shoping : I am Shopping Service" });
  });
};
