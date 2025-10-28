import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Use a default secret if JWT_SECRET is not set
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-for-development';

  // Verify token
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token expired' });
      }
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    // Add user info to request object
    req.user = user;
    next();
  });
};

export {
  authenticateToken
};