const kafkajs = require("kafkajs");

const { KAFKA_BROKERS } = require("./constants");

const kafka = new kafkajs.Kafka({
  clientId: "people",
  brokers: KAFKA_BROKERS.split(",").map((kafkaBroker) => kafkaBroker.trim()),
});

const producer = kafka.producer();

module.exports = producer;
