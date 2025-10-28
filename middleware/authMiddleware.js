import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-for-development';
      const decoded = jwt.verify(token, jwtSecret);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      // Remove development-only logging
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };