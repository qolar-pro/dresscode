// Session store for admin authentication
// In production, use Redis or a database instead of in-memory Map

export const sessions = new Map<string, { createdAt: number }>();

// Session timeout: 30 minutes
export const SESSION_TTL = 30 * 60 * 1000;

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(token);
    }
  }
}, 5 * 60 * 1000);
