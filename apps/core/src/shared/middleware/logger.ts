import { createMiddleware } from 'hono/factory';

export const requestLogger = createMiddleware(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const userAgent = c.req.header('user-agent') || '';

  console.log(`📥 ${method} ${path} - ${userAgent}`);

  await next();

  const status = c.res.status;
  const duration = Date.now() - start;
  
  const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
  
  console.log(`${statusEmoji} ${method} ${path} ${status} - ${duration}ms`);
});