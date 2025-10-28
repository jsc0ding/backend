import jwt from 'jsonwebtoken';

// Admin authentication middleware
const requireAdmin = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Kirish tokeni talab qilinadi' });
  }

  // Use JWT_SECRET from environment or default
  const jwtSecret = process.env.JWT_SECRET || 'default-secret-key-for-development';

  // Verify token
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token muddati tugagan' });
      }
      return res.status(403).json({ message: 'Yaroqsiz token' });
    }
    
    // Check if user is admin
    if (user.id !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat etilmagan' });
    }
    
    // Add user info to request object
    req.user = user;
    next();
  });
};

export default requireAdmin;