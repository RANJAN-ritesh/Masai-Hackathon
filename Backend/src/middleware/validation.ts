import { Request, Response, NextFunction } from 'express';

// Basic validation middleware
export const validateUserInput = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;
    
    // Email validation
    if (email && !email.includes('@')) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
    }
    
    // Password validation (minimum 6 characters)
    if (password && password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long' });
        return;
    }
    
    next();
};

export const validateTeamInput = (req: Request, res: Response, next: NextFunction): void => {
    const { teamName } = req.body;
    
    if (teamName && teamName.trim().length < 2) {
        res.status(400).json({ message: 'Team name must be at least 2 characters long' });
        return;
    }
    
    next();
}; 