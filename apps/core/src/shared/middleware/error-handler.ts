import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';

export const errorHandler = createMiddleware(async (c, next) => {
  try {
    await next();
  } catch (error) {
    console.error('🚨 Unhandled error:', error);

    if (error instanceof HTTPException) {
      return error.getResponse();
    }

    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('required') || error.message.includes('invalid')) {
        return c.json({
          error: 'Validation Error',
          message: error.message,
          timestamp: new Date().toISOString()
        }, 400);
      }

      // Handle business logic errors
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        return c.json({
          error: 'Not Found',
          message: error.message,
          timestamp: new Date().toISOString()
        }, 404);
      }

      return c.json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      }, 500);
    }

    return c.json({
      error: 'Unknown Error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString()
    }, 500);
  }
});