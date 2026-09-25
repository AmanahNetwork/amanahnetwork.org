import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import AuthorizedAgent from '../models/AuthorizedAgent.js';

// Constant-time string comparison to prevent timing attacks
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

export const adminAuth = async (req, res, next) => {
  const useSecretKey = (
    req.headers['x-governance-key'] ||
    req.headers['use-secret-key'] ||
    req.headers['x-admin-key'] ||
    req.headers['admin-key'] ||
    ''
  ).trim();

  // 1. Check for Master Governance Key with constant-time comparison
  const adminKey = (process.env.ADMIN_KEY || '').trim();
  if (adminKey && useSecretKey && safeCompare(useSecretKey, adminKey)) {
    req.user = { 
      _id: process.env.SYSTEM_ADMIN_ID || 'system_master_admin', 
      role: 'ADMIN',
      email: 'governance@amanahnetwork.org'
    };
    return next();
  }

  // 2. Extract JWT token from HttpOnly cookie or Authorization Bearer header
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

    // 3. Handle AGENT role
    if (decoded.role === 'AGENT') {
      const agent = await AuthorizedAgent.findById(decoded.id).select('-password');
      if (agent) {
        req.user = {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          role: 'AGENT',
          permissions: agent.permissions || ['TRANSFER']
        };
        return next();
      }
      return res.status(403).json({ error: "Access Denied. Agent account not found or inactive." });
    }

    // 4. Handle ADMIN / USER roles
    const user = await User.findById(decoded.id).select('-verificationToken -password');
    if (user && user.isVerified) {
      if (user.role === 'ADMIN') {
        req.user = user;
        return next();
      }
      return res.status(403).json({ error: "Access Denied. Administrator role required." });
    }

    return res.status(403).json({ error: "Access Denied. Insufficient permissions or unverified account." });
  } catch (err) {
    console.error("Auth Middleware JWT Verification Error:", err.message);
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
};

export default adminAuth;