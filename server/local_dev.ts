import { serve } from '@hono/node-server';
import app from './index';

console.log('Starting local development server on http://localhost:3001...');

serve({
  fetch: app.fetch,
  port: 3001
});
