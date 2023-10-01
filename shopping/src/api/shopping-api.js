const ShoppingService = require("../services/shopping-service");
const { PublishCustomerEvent, SubscribeMessage } = require("../utils");

const UserAuth = require("./middlewares/auth");

module.exports = (app, channel) => {
    const service = new ShoppingService();

    SubscribeMessage(channel, service);

}