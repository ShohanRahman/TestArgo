const express = require("express");
const expressProm = require("express-prom-bundle");
const expressPinoLogger = require("express-pino-logger");

const people = require("./routes");
const logger = require("./logger");
const producer = require("./kafka");

const app = express();

app.use(expressPinoLogger({ logger }));
app.use(expressProm());
app.use(express.json());
app.use("/api/v1/people", people);
app.listen(process.env.PORT || 8000, () => {
  producer.connect();
  logger.info(`Running on port ${process.env.PORT || 8000}`);
});

module.exports = app;
