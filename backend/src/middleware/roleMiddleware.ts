import { Request, Response, NextFunction } from 'express';
import { UserRole, IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: {
      role: UserRole;
    };
  }
// role permission checker
const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
};

export default authorize;