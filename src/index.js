import { Router } from 'itty-router';

const router = Router();

router.get('/api/health', () => {
  return new Response(JSON.stringify({ status: 'ok' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

// Placeholder for future API routes
router.post('/api/login', () => new Response(JSON.stringify({ token: 'mock-jwt-token' }), { headers: { 'Content-Type': 'application/json' } }));
router.get('/api/accounts', () => new Response(JSON.stringify([]), { headers: { 'Content-Type': 'application/json' } }));
router.post('/api/accounts', () => new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } }));

// 404 handler
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
  fetch: router.fetch,
};
