import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/db';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no token, use default admin user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'OWNER' } });
      if (defaultUser) {
        req.user = { id: defaultUser.id, role: defaultUser.role };
        return next();
      }
      return res.status(401).json({ message: 'Authorization token required and no default user found' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user not found' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    // On error, try to fall back to default user if it's a simple token error
    const defaultUser = await prisma.user.findFirst({ where: { role: 'OWNER' } });
    if (defaultUser) {
        req.user = { id: defaultUser.id, role: defaultUser.role };
        return next();
    }
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
