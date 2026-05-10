const { sendError } = require("../utils");

const validate = (schema, property = "body") => (req, res, next) => {
  const { error, value } = schema.validate(req[property], {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message
    }));

    console.error("[Validation Error]", errors);
    return sendError(res, 400, "Validation failed", errors);
  }

  req[property] = value;
  next();
};

module.exports = validate;
