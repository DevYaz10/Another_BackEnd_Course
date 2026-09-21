export const errorHandler = (error, request, reply) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || "Server Error";

  // Mongoose: a malformed ObjectId was used in a query or a route param.
  if (error.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // MongoDB: unique index violation (e.g. the `unique: true` on User.email).
  else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    statusCode = 400;
    message = field ? `Duplicate value for ${field}` : "Duplicate field value entered";
  }

  // Mongoose: schema validation failed ("ValidationError", capital V).
  else if (error.name === "ValidationError") {
    statusCode = 400;
    message = error.errors
      ? Object.values(error.errors)
          .map((fieldError) => fieldError.message)
          .join(", ")
      : message;
  }

  request.log.error(error);

  reply.code(statusCode).send({ success: false, error: message });
};


export const notFoundHandler = (request, reply) => {
  reply.code(404).send({
    success: false,
    error: `Route ${request.method}:${request.url} not found`,
  });
};

export default errorHandler;
