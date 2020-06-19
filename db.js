const { MongoClient } = require("mongodb");

const logger = require("./logger");
const { DB_NAME } = require("./constants");
const mongo_uri =
  process.env.MONGODB_URL || "mongodb://root:root@10.0.2.2:27017";

const getDBConnection = async () => {
  return await MongoClient.connect(mongo_uri, { useUnifiedTopology: true });
};

const getDB = async (dbConnection) => {
  logger.info({ DB_NAME }, `Connecting to the DB ${DB_NAME}.`);
  return dbConnection.db(DB_NAME);
};

module.exports = {
  getDB,
  getDBConnection,
};
