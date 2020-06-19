const express = require("express");
const { ObjectID } = require("mongodb");
const HTTP_CODE = require("http-status-codes");
const { FORMAT_HTTP_HEADERS } = require("opentracing");

const { getDB, getDBConnection } = require("./db");
const logger = require("./logger");
const { postPeopleSchema } = require("./schemas");
const tracer = require("./jaeger");
const producer = require("./kafka");

const router = express.Router();

function initTrace(tracer) {
  return function (req, res, next) {
    req.span = tracer.startSpan("request");
    req.span.setTag("x-request-id", req.id);
    req.span.setTag("http.method", req.method);
    req.span.setTag("http.url", req.url);
    next();
  };
}
router.use(initTrace(tracer));

router.get("/", async (req, res) => {
  const span = tracer.startSpan("get peoples");
  span.setTag("x-request-id", req.id);
  const spanDbConnection = tracer.startSpan("get db connection", {
    childOf: span,
  });
  const dbConnection = await getDBConnection();
  spanDbConnection.finish();
  // const spanSearchDb = tracer.startSpan("Searching in db", {
  //   childOf: span,
  // });
  const db = await getDB(dbConnection);
  span.logEvent("Searching in DB");
  await db
    .collection("people")
    .find()
    .toArray((err, peoples) => {
      // spanSearchDb.finish();
      if (err) {
        logger.error("Error on the fetch of the database.");
        res
          .status(HTTP_CODE.METHOD_NOT_ALLOWED)
          .set(req.id)
          .send({ message: "Something went wrong on mongodb." });
      } else {
        logger.info({ peoples }, "Peoples informations.");
        span.finish();
        res.status(HTTP_CODE.OK).set("x-request-id", req.id).json(peoples);
      }
    });
});

router.post("/", async ({ body, id, span: spanReq }, res) => {
  try {
    const span = tracer.startSpan("post peoples", { childOf: spanReq });
    span.setTag("x-request-id", id);
    const spanSchema = tracer.startSpan("check schema", {
      childOf: span,
    });
    const { error } = postPeopleSchema.validate({ ...body });
    if (error) {
      span.logEvent("Schema incorrect");
      spanSchema.finish();
      logger.error("Incorrect post people schema");
      return res.status(HTTP_CODE.BAD_REQUEST).set(id).json({ error });
    }
    spanSchema.finish();
    const spanDb = tracer.startSpan("db initialization", {
      childOf: span,
    });

    const dbConnection = await getDBConnection();
    const db = await getDB(dbConnection);
    spanDb.finish();

    const peopleToInsert = {
      ...body,
      createdAt: Date.now(),
    };

    const spanInsert = tracer.startSpan("Insert into db", {
      childOf: span,
    });

    const people = await db.collection("people").insertOne(peopleToInsert);
    const message = {
      id: id,
      source: "com.training.people",
      specversion: "1.0",
      type: "com.training.people.peopleCreated.v1",
      datacontenttype: "application/json",
      time: new Date().toISOString(),
      data: {
        people: people.ops[0],
      },
    };
    spanInsert.finish();
    span.finish();
    spanReq.setTag("span-type", "producer");
    tracer.inject(spanReq.context(), FORMAT_HTTP_HEADERS, message);

    producer.send({
      topic: "training_people_created",
      messages: [{ value: JSON.stringify(message) }],
    });
    spanReq.finish();
    logger.info({ people: people.ops[0] }, "People inserted.");
    return res.status(HTTP_CODE.CREATED).set(id).json(people.ops[0]);
  } catch (err) {
    return res
      .status(HTTP_CODE.INTERNAL_SERVER_ERROR)
      .send({ message: "Something went wrong on the server." });
  }
});

router.get("/:personId", async ({ params: { personId }, id }, res) => {
  try {
    const span = tracer.startSpan("get people with id");

    span.setTag("x-request-id", id);
    const spanDB = tracer.startSpan("db initialization", {
      childOf: span,
    });
    const dbConnection = await getDBConnection();
    const db = await getDB(dbConnection);
    spanDB.finish();
    const spanMongoId = tracer.startSpan("creation of ID", {
      childOf: span,
    });
    const criteria = {
      _id: null,
    };
    try {
      criteria._id = new ObjectID(personId);
    } catch (err) {
      spanMongoId.finish();
      return res
        .status(HTTP_CODE.NOT_FOUND)
        .set(id)
        .send({ message: "ID not found." });
    }
    spanMongoId.finish();
    const spanSearchDb = tracer.startSpan("Search people", {
      childOf: span,
    });

    await db.collection("people").findOne(criteria, (err, doc) => {
      spanSearchDb.finish();
      if (doc != null) {
        span.finish();
        logger.info({ doc }, "Get with id.");
        return res.status(HTTP_CODE.OK).set(id).json(doc);
      }
      logger.error({ personId }, "The people with this id was not found.");
      span.finish();
      return res
        .status(HTTP_CODE.NOT_FOUND)
        .set(id)
        .send({ message: "People not found." });
    });
  } catch (err) {
    res
      .status(HTTP_CODE.INTERNAL_SERVER_ERROR)
      .send({ message: "Something went wrong on the server." });
  }
});

router.delete("/:personId", async ({ params: { personId }, id }, res) => {
  try {
    const span = tracer.startSpan("delete people with id");
    span.setTag("x-request-id", id);
    const spanDb = tracer.startSpan("Db initialization", { childOf: span });
    const dbConnection = await getDBConnection();
    const db = await getDB(dbConnection);
    spanDb.finish();
    const criteria = {
      _id: null,
    };
    try {
      criteria._id = new ObjectID(personId);
    } catch (err) {
      return res
        .status(HTTP_CODE.NOT_FOUND)
        .set(id)
        .send({ message: "ID not found." });
    }
    const spanDelete = tracer.startSpan("Deleting in db", { childOf: span });
    const result = await db.collection("people").deleteOne(criteria);
    spanDelete.finish();
    logger.info({ personId }, "This id has been deleted.");
    span.finish();
    res.status(HTTP_CODE.OK).set(id).send({ message: "Deleted successfully." });
  } catch (err) {
    res
      .status(HTTP_CODE.INTERNAL_SERVER_ERROR)
      .send({ message: "Something went wrong on the server." });
  }
});

module.exports = router;
