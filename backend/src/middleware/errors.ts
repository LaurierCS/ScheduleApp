export class BaseError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class AuthenticationError extends BaseError {
    constructor(message = "Authentication failed") {
      super(message, 401);
    }
  }
  
  export class ValidationError extends BaseError {
    constructor(message = "Validation error") {
      super(message, 400);
    }
  }
  
  export class NotFoundError extends BaseError {
    constructor(message = "Resource not found") {
      super(message, 404);
    }
  }
  
  export class ServerError extends BaseError {
    constructor(message = "Internal server error") {
      super(message, 500);
    }
  }
  

