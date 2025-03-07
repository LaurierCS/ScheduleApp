import { Request, Response, NextFunction } from 'express';

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
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
}; 