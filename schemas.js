const Joi = require("@hapi/joi");

const postPeopleSchema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer().min(0).max(160).required(),
  city: Joi.string().required(),
});

module.exports = {
  postPeopleSchema,
};
