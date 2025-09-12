import { Request, Response, NextFunction } from 'express';
import user from '../model/user';
import rateLimit from 'express-rate-limit';
import { verifyToken } from '../config/jwt';

// JWT configuration is now centralized in config/jwt.ts

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased limit for better UX
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

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
    
    if (!token) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    try {
      // Use centralized JWT verification
      const decoded = verifyToken(token);
      
      if (!decoded) {
        console.log('❌ JWT verification failed: Invalid token');
        return res.status(401).json({ message: 'Invalid token' });
      }

      console.log('✅ JWT DECODED:', decoded);

      if (decoded.userId) {
        const foundUser = await user.findById(decoded.userId);
        console.log('🔍 FOUND USER:', foundUser ? foundUser._id : 'NOT FOUND');

        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
          console.log('❌ TOKEN EXPIRED');
          return res.status(401).json({ message: 'Token expired' });
        }

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
      } else {
        return res.status(401).json({ message: 'Invalid token payload' });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Authentication failed' });
    }

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
        try {
          const decoded = verifyToken(token);
          if (decoded && decoded.userId) {
            const foundUser = await user.findById(decoded.userId);
          
            if (foundUser && foundUser.isVerified) {
              req.user = {
                id: (foundUser._id as any).toString(),
                email: foundUser.email,
                role: foundUser.role,
                name: foundUser.name
              };
            }
          }
        } catch (jwtError) {
          // Continue without authentication if JWT is invalid
          console.log('Invalid JWT in optional auth, continuing without user');
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

// JWT utility functions are now centralized in config/jwt.ts 