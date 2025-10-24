import { Request, Response, NextFunction } from 'express';
import { isProduction } from "../config/env.config";

// not found error handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// general error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    message: err.message,
    stack: isProduction() ? null : err.stack,
  });
};