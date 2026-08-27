import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const adminAuth = async (req, res, next) => {
  const useSecretKey = req.headers['use-secret-key'] || req.headers['x-governance-key'];

  // 1. Check for Master Key
  const adminKey = (process.env.ADMIN_KEY || '').trim();
  if (adminKey && useSecretKey && useSecretKey.trim() === adminKey) {
    req.user = { _id: process.env.SYSTEM_ADMIN_ID || 'SYSTEM_ADMIN', role: 'ADMIN' };
    return next();
  }

  // 2. Extract and verify JWT token from cookie or Authorization header
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Access Denied. Authentication token required." });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: "Server Configuration Error: JWT_SECRET missing" });
    }

    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.id).select('-verificationToken');
    
    if (user && user.isVerified && (user.role === 'ADMIN' || decoded.role === 'AGENT')) {
      req.user = user;
      return next();
    }
    
    return res.status(403).json({ error: "Access Denied. Insufficient permissions." });
  } catch (err) {
    console.error("Auth Middleware JWT Verification Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

export default adminAuth;