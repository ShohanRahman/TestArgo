const LOG_LEVEL = Object.freeze({
  DEBUG: "debug",
  ERROR: "error",
  FATAL: "fatal",
  INFO: "info",
});

module.exports = {
  DB_NAME: process.env.DB_NAME || "training",
  LOG_LEVEL: process.env.LOG_INFO || LOG_LEVEL.INFO,
  KAFKA_BROKERS: process.env.KAFKA_BROKERS || "10.0.2.2:9093",
};
