import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const API_KEYS = new Set<string>(process.env.API_KEYS?.split(',') || ['dev-key-123']);
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  if (authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.slice(7);
    if (API_KEYS.has(apiKey)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).authMethod = 'api-key';
      next();
      return;
    }
  }

  if (authHeader.startsWith('Token ')) {
    const token = authHeader.slice(6);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).authMethod = 'jwt';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (req as any).authUser = decoded;
      next();
      return;
    } catch {
      res.status(401).json({ error: 'Invalid JWT token' });
      return;
    }
  }

  res.status(401).json({ error: 'Invalid authorization format' });
}
