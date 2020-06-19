const pino = require("pino");

const { LOG_LEVEL } = require("./constants");

const logger = pino({ level: LOG_LEVEL, prettyPrint: true });

module.exports = logger;
