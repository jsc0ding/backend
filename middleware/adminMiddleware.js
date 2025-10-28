import User from '../models/User.js';

const requireAdmin = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user token' });
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({ message: 'Server error during admin authorization' });
  }
};

export { requireAdmin };