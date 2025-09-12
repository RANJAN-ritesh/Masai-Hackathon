// Centralized JWT configuration
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'masai-hackathon-jwt-secret-key-2025',
  EXPIRES_IN: '7d'
};

// JWT utility functions
import jwt from 'jsonwebtoken';

export const generateToken = (payload: { userId: string; email: string; role: string }): string => {
  return jwt.sign(payload, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN } as jwt.SignOptions);
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_CONFIG.SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};

export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
};
