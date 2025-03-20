import { Request, Response, NextFunction } from 'express';
import { BaseError } from "././errors";

// not found error handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// general error handler
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode; // had to change const -> let 
  let errorCode = ""; 

  if (err instanceof BaseError) {
    statusCode = err.statusCode;
    errorCode = err.constructor.name.toUpperCase();
  } else {
    // other errors will go to default
    statusCode = 500;
    errorCode = "INTERNAL SERVER ERROR";
  }

  //currently in consol lmk if we want it in a file
  // logging timestamp, path, method 
  console.error(`[${new Date().toISOString()}] [${req.method} ${req.originalUrl}] [ERROR ${errorCode}]: ${err.message}`); 

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || "An unexpected error occurred",
    },
    errorDetails: {
      path: req.originalUrl,
      method: req.method,
    },
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

