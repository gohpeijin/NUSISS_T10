const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const amqplib = require("amqplib");

const { APP_SECRET, MSG_QUEUE_URL, EXCHANGE_NAME, SHOPPING_SERVICE  } = require('../config');

//Utility functions
  (module.exports.ValidateSignature = async (req) => {
    const signature = req.get('Authorization');

    if (signature) {
      const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
      req.user = payload;
      return true;
    }

    return false;
  });

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error('Data Not found!');
  }
};

//Message Broker
module.exports.CreateChannel = async () => {
    try {
      const connection = await amqplib.connect(MSG_QUEUE_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(EXCHANGE_NAME, "direct", { durable: true });
      return channel;
    } catch (err) {
      throw err;
    }
  };


module.exports.PublishMessage = (channel, service, msg) => {
  channel.publish(EXCHANGE_NAME, service, Buffer.from(msg));
  console.log("Sent: ", msg);
};

module.exports.SubscribeMessage = async (channel, service) => {
  await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
  const q = await channel.assertQueue("", { exclusive: true });
  console.log(` Shopping Service waiting for messages in queue: ${q.queue}`);

  channel.bindQueue(q.queue, EXCHANGE_NAME, SHOPPING_SERVICE);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg.content) {
        console.log("Message is:", msg.content.toString());
        service.SubscribeEvents(msg.content.toString());
      }
      console.log("Empty message received");
    },
    {
      noAck: true,
    }
  );
};

