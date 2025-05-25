import { Hono } from 'hono';

const healthApp = new Hono();

healthApp.get('/', (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default healthApp;
