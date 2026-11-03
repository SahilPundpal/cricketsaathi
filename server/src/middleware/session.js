// Gives every visitor their own demo match. The client sends a random id in X-Session-Id.
const VALID_ID = /^[A-Za-z0-9_-]{8,64}$/;

export function sessionMiddleware(req, _res, next) {
  const raw = req.get('x-session-id');
  req.sessionId = raw && VALID_ID.test(raw) ? raw : 'default';
  next();
}
