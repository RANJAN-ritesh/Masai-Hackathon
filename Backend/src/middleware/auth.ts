import { Request, Response, NextFunction } from 'express';
import user from '../model/user';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

// Authentication middleware
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For now, we'll use a simple token system
    // In production, this should be a proper JWT token
    // For testing purposes, we'll accept the user ID as the token
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find user by ID (treating the token as user ID for now)
    const foundUser = await user.findById(token);
    
    if (!foundUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!foundUser.isVerified) {
      return res.status(401).json({ message: 'User not verified' });
    }

    // Add user info to request
    req.user = {
      id: (foundUser._id as any).toString(),
      email: foundUser.email,
      role: foundUser.role,
      name: foundUser.name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

// Optional authentication middleware (for routes that can work with or without auth)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        const foundUser = await user.findById(token);
        
        if (foundUser && foundUser.isVerified) {
          req.user = {
            id: (foundUser._id as any).toString(),
            email: foundUser.email,
            role: foundUser.role,
            name: foundUser.name
          };
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based authorization middleware
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

// Admin-only middleware
export const requireAdmin = requireRole(['admin']);

// Team member or admin middleware
export const requireTeamMemberOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  // For team members, additional checks can be added here
  next();
}; 