import { ApiError } from '../exceptions/api.error.js';

export const errorMiddleware = (error, req, res, next) => {
  if (error instanceof ApiError) {
    res.status(error.status).send({
      message: error.message,
      error: error.errors,
    })
  }


  res.statusCode = 500;
  res.send({
    message: 'Server error',
  })
};
