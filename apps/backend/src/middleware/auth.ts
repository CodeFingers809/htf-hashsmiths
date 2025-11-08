import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/backend';

export interface AuthRequest extends Request {
  auth?: {
    userId: string;
    sessionId: string;
  };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.substring(7);

    // Verify the session token with Clerk
    const sessionClaims = await clerkClient.sessions.verifySession(token, token);

    if (!sessionClaims || !sessionClaims.userId) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Attach auth info to request
    req.auth = {
      userId: sessionClaims.userId,
      sessionId: sessionClaims.id,
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const sessionClaims = await clerkClient.sessions.verifySession(token, token);

      if (sessionClaims && sessionClaims.userId) {
        req.auth = {
          userId: sessionClaims.userId,
          sessionId: sessionClaims.id,
        };
      }
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without auth info
    next();
  }
}
