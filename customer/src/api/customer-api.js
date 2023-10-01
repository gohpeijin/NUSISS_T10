const CustomerService = require("../services/customer-service");
const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
  const service = new CustomerService();

  app.post("/customer/signup", async (req, res, next) => {
    try {
      const { email, password, phone } = req.body;
      const data = await service.SignUp({ email, password, phone });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/customer/login", async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const data = await service.SignIn({ email, password });
      return res.json(data);
    } catch (error) {
      next(error);
    }
  });

  app.get("/customer/get/dummy", async (req, res, next) => {
    //check validation
    try {
      return res.status(200).json("yay deploy success for customer");
    } catch (error) {
      return res.status(404).json({ error });
    }
  });
};
