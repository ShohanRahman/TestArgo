const jaeger = require("jaeger-client");
const logger = require("./logger");

const tracer = jaeger.initTracerFromEnv({ serviceName: "training" });

module.exports = tracer;
