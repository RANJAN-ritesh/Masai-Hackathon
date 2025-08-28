import { Request, Response, NextFunction } from 'express';
import user from '../model/user';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
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
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (!decoded.userId) {
        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Find user by ID from JWT
      const foundUser = await user.findById(decoded.userId);
    
      if (!foundUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!foundUser.isVerified) {
        return res.status(401).json({ message: 'User not verified' });
      }

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ message: 'Token expired' });
      }

      // Add user info to request
      req.user = {
        id: (foundUser._id as any).toString(),
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name
      };

      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Invalid token' });
      } else if (jwtError instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Token verification failed' });
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
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const foundUser = await user.findById(decoded.userId);
        
          if (foundUser && foundUser.isVerified) {
            req.user = {
              id: (foundUser._id as any).toString(),
              email: foundUser.email,
              role: foundUser.role,
              name: foundUser.name
            };
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

// Generate JWT token for user
export const generateToken = (userId: string, email: string, role: string): string => {
  return jwt.sign(
    { 
      userId, 
      email, 
      role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    },
    JWT_SECRET
  );
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}; 