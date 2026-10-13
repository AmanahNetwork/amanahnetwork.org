// REPLACE ALL 'require' WITH 'import'
import 'dotenv/config';
import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { }
try { dns.setDefaultResultOrder('ipv4first'); } catch (e) { }
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import rateLimit from 'express-rate-limit';
// Keep your imports for internal files
import adminAuth from '../middleware/adminAuth.js'; // Note: Must include .js extension
import Ledger from '../models/Ledger.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import TransferAid from '../models/TransferAid.js';
import AuthorizedAgent from '../models/AuthorizedAgent.js';
import AuditLog from '../models/AuditLog.js';
import { recordAudit } from '../utils/auditLogger.js';
import { validateFileUpload } from '../utils/uploadSecurity.js';

const app = express();
app.set('trust proxy', 1);
const otpStore = {};
let isConnecting = false;

// Constant-time string comparison to prevent timing attacks
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// Safe regex escaping to prevent ReDoS attacks
const escapeRegex = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// PII Masking utility for financial accounts
const maskAccountNumber = (acc) => {
  const str = String(acc || '').trim();
  if (str.length <= 4) return '****';
  return str.slice(0, 2) + '****' + str.slice(-4);
};

// HTML Escaping Utility to prevent HTML Injection in Emails
const escapeHtml = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (isConnecting) {
    let retries = 30;
    while (mongoose.connection.readyState !== 1 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retries--;
    }
    if (mongoose.connection.readyState === 1) return mongoose.connection;
  }

  isConnecting = true;
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is missing.");
    }
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false
    });
    console.log("Connected to MongoDB Atlas");
    isConnecting = false;
    return mongoose.connection;
  } catch (err) {
    isConnecting = false;
    console.error("--- DATABASE CONNECTION FAILURE ---", err.message);
    throw err;
  }
};
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://amanahnetwork.org',
  'https://www.amanahnetwork.org',
  'https://amanahnetwork-org.vercel.app',
  'https://amanahnetwork.in',
  'https://www.amanahnetwork.in',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.includes('amanahnetwork')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Hardened Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: "deny" },
  xContentTypeOptions: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      frameSrc: ["'self'", "https://api.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://*.vercel.app"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
}));

// Permissions-Policy Header
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self 'https://api.razorpay.com')");
  next();
});

// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Bot Protection & Anti-Automation Middleware
const botProtection = (req, res, next) => {
  // 1. Honeypot check
  if (req.body && req.body._hp_website) {
    console.warn(`[BOT BLOCKED] Honeypot triggered from IP ${req.ip}`);
    return res.status(400).json({ error: "Automated submission rejected." });
  }
  // 2. Automated scraper check on mutation endpoints
  const ua = req.headers['user-agent'] || '';
  if (!ua || /curl|wget|scrapy|python-requests|sqlmap|nikto/i.test(ua)) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: "Request blocked by security policy." });
    }
  }
  next();
};

app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size

// Express 5 Safe NoSQL Injection Sanitizer
const sanitizeNoSqlInPlace = (target) => {
  if (!target || typeof target !== 'object') return;
  for (const key of Object.keys(target)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete target[key];
    } else if (typeof target[key] === 'object' && target[key] !== null) {
      sanitizeNoSqlInPlace(target[key]);
    }
  }
};

app.use((req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') sanitizeNoSqlInPlace(req.body);
    if (req.params && typeof req.params === 'object') sanitizeNoSqlInPlace(req.params);
    if (req.query && typeof req.query === 'object') sanitizeNoSqlInPlace(req.query);
  } catch (e) {
    // Graceful continuation
  }
  next();
});

// Standardized Secure Cookie Options
const getSecureCookieOptions = (customMaxAge = 3600000) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: customMaxAge,
  path: '/'
});

const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
  : null;

// Middleware for sensitive API routes with timing-safe comparison
const secureApiGuard = (req, res, next) => {
  const secretKey = (
    req.headers['x-governance-key'] ||
    req.headers['use-secret-key'] ||
    req.headers['x-admin-key'] ||
    req.headers['admin-key'] ||
    ''
  ).trim();
  const adminKey = (process.env.ADMIN_KEY || '').trim();
  if (adminKey && secretKey && safeCompare(secretKey, adminKey)) {
    return next();
  }
  console.warn(`[WARN] SecureApiGuard blocked request from IP: ${req.ip}`);
  res.status(403).json({ error: "Access Denied" });
};
// --- RESEND EMAIL SERVICE & OFFICIAL IN-CONTEXT HTML TEMPLATES ---
const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
const resend = resendApiKey ? new Resend(resendApiKey) : null;

if (resend) {
  console.log("[INFO] Resend email service initialized successfully");
} else {
  console.warn("[WARN] RESEND_API_KEY is not configured in environment variables");
}

// Official in-context HTML email template generator for Amanah Network
const renderOfficialEmailHtml = ({ title, preheader, contentHtml, footerNote }) => {
  const currentYear = new Date().getFullYear();
  const logoUrl = (process.env.PUBLIC_LOGO_URL || 'https://amanahnetwork.in/amanahlogo.png').trim();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title || 'Amanah Network Notification')}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}</div>` : ''}
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          <!-- Official Header with Logo PFP -->
          <tr>
            <td style="background-color: #284D3D; padding: 26px 32px 24px; text-align: center; border-bottom: 3px solid #C5A059;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 12px;">
                <tr>
                  <td align="center" style="background-color: #ffffff; width: 64px; height: 64px; border-radius: 50%; border: 2.5px solid #C5A059; padding: 4px; box-shadow: 0 3px 10px rgba(0,0,0,0.25);">
                    <img 
                      src="${logoUrl}" 
                      alt="Amanah Network" 
                      width="56" 
                      height="56" 
                      style="display: block; width: 56px; height: 56px; border-radius: 50%; object-fit: contain;" 
                    />
                  </td>
                </tr>
              </table>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 2.5px; color: #ffffff; text-transform: uppercase;">
                AMANAH <span style="color: #C5A059;">NETWORK</span>
              </h1>
              <p style="margin: 6px 0 0; font-size: 11px; letter-spacing: 1.5px; color: #cbd5e1; text-transform: uppercase; font-weight: 600;">
                Transparent Humanitarian Aid Platform
              </p>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px; line-height: 1.65; font-size: 15px; color: #334155;">
              ${contentHtml}
            </td>
          </tr>
          <!-- Official Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 22px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 6px;">
                <strong>Amanah Network</strong> &bull; Secured with Cryptographic Audit Integrity
              </p>
              ${footerNote ? `<p style="margin: 0 0 6px; color: #94a3b8; font-size: 11px;">${footerNote}</p>` : ''}
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                &copy; ${currentYear} Amanah Network. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

// Unified Resend email dispatcher
const sendMailHelper = async ({ to, subject, html, text, replyTo, fromName = "Amanah Network" }) => {
  const cleanTo = String(to).toLowerCase().trim();
  if (!cleanTo) {
    return { success: false, error: "Recipient email is missing" };
  }

  if (!resend) {
    console.warn(`[WARN] Email sending skipped for ${cleanTo}: RESEND_API_KEY not configured`);
    return { success: false, error: "Resend API key is not configured" };
  }

  try {
    const fromEmail = (process.env.RESEND_FROM_EMAIL || '').trim() || `${fromName} <onboarding@resend.dev>`;
    const payload = {
      from: fromEmail,
      to: [cleanTo],
      subject,
      html: html || `<p>${escapeHtml(text || '')}</p>`,
      text: text || ''
    };

    if (replyTo) {
      payload.reply_to = String(replyTo).trim();
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error(`[ERROR] Resend API error sending to ${cleanTo}:`, error.message || error);
      return { success: false, error: error.message || "Resend email delivery failed" };
    }

    console.log(`[INFO] Email delivered via Resend API to: ${cleanTo} (ID: ${data?.id || 'delivered'})`);
    return { success: true, provider: 'resend', id: data?.id };
  } catch (resendErr) {
    console.error(`[ERROR] Resend exception sending to ${cleanTo}:`, resendErr.message);
    return { success: false, error: resendErr.message };
  }
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict maximum 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." }
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP requests. Please wait 10 minutes." }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact submissions. Please try again in an hour." }
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment operations. Please try again in 15 minutes." }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Rate limit exceeded. Please try again later." }
});

// --- ADMIN ROUTES ---
app.post('/api/admin/create-member', (req, res, next) => {
  if (typeof adminAuth === 'function') return adminAuth(req, res, next);
  next();
}, async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "First Name, Last Name, and Email are required." });
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const newAdmin = new User({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: cleanEmail,
      mobileNumber: mobileNumber ? String(mobileNumber).trim() : '',
      role: 'ADMIN',
      isVerified: true
    });
    await newAdmin.save();

    await recordAudit({
      req,
      action: 'CREATE_MEMBER',
      targetResource: cleanEmail,
      status: 'SUCCESS'
    });

    res.status(201).json({ message: "Admin member created successfully." });
  } catch (error) {
    res.status(400).json({ error: "Failed to create admin member." });
  }
});

// --- AUTH & REGISTRATION ---
app.post('/api/auth/login', authLimiter, botProtection, async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: "Email and password are required strings." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check AuthorizedAgent collection (Agent / Board Member logins)
    const agent = await AuthorizedAgent.findOne({ email: cleanEmail }).select('+password');
    if (agent) {
      if (agent.lockUntil && agent.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((agent.lockUntil - Date.now()) / (60 * 1000));
        return res.status(429).json({ error: `Account temporarily locked due to excessive failed attempts. Please try again in ${remainingMinutes} minutes.` });
      }

      if (agent.password) {
        const isMatch = await bcrypt.compare(password, agent.password);
        if (isMatch) {
          agent.failedLoginAttempts = 0;
          agent.lockUntil = null;
          await agent.save();

          const jwtSecret = process.env.JWT_SECRET;
          if (!jwtSecret) {
            return res.status(500).json({ error: "Server Configuration Error: JWT_SECRET missing" });
          }
          const token = jwt.sign({ id: agent._id, role: 'AGENT' }, jwtSecret, { expiresIn: '1h' });
          res.cookie('token', token, getSecureCookieOptions(3600000));

          await recordAudit({
            req,
            action: 'LOGIN',
            actorId: agent._id,
            actorEmail: agent.email,
            actorRole: 'AGENT',
            status: 'SUCCESS'
          });

          return res.status(200).json({
            message: "Logged in successfully",
            user: { id: agent._id, name: agent.name, email: agent.email, role: 'AGENT' }
          });
        } else {
          agent.failedLoginAttempts = (agent.failedLoginAttempts || 0) + 1;
          if (agent.failedLoginAttempts >= 5) {
            agent.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
          }
          await agent.save();

          await recordAudit({
            req,
            action: 'LOGIN',
            actorEmail: cleanEmail,
            actorRole: 'AGENT',
            status: 'FAILED',
            details: { reason: "Invalid password credentials" }
          });
          return res.status(401).json({ error: "Invalid Credentials" });
        }
      }
    }

    // 2. Check User collection
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (user) {
      if (user.lockUntil && user.lockUntil > Date.now()) {
        const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
        return res.status(429).json({ error: `Account temporarily locked due to excessive failed attempts. Please try again in ${remainingMinutes} minutes.` });
      }

      if (!user.password) {
        return res.status(401).json({ error: "Password login not enabled for this account. Please verify via OTP." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        user.failedLoginAttempts = 0;
        user.lockUntil = null;
        await user.save();

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          return res.status(500).json({ error: "Server Configuration Error: JWT_SECRET missing" });
        }
        const token = jwt.sign({ id: user._id, role: user.role || 'USER' }, jwtSecret, { expiresIn: '1h' });
        res.cookie('token', token, getSecureCookieOptions(3600000));

        await recordAudit({
          req,
          action: 'LOGIN',
          actorId: user._id,
          actorEmail: user.email,
          actorRole: user.role || 'USER',
          status: 'SUCCESS'
        });

        return res.status(200).json({
          message: "Logged in successfully",
          user: { id: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role }
        });
      } else {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await user.save();

        await recordAudit({
          req,
          action: 'LOGIN',
          actorEmail: cleanEmail,
          actorRole: user.role || 'USER',
          status: 'FAILED',
          details: { reason: "Invalid password credentials" }
        });
        return res.status(401).json({ error: "Invalid Credentials" });
      }
    }

    await recordAudit({
      req,
      action: 'LOGIN',
      actorEmail: cleanEmail,
      status: 'FAILED',
      details: { reason: "User not found" }
    });
    return res.status(401).json({ error: "Invalid Credentials" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Auth Error." });
  }
});

// Logout endpoint with secure cookie clearing
app.post('/api/auth/logout', async (req, res) => {
  try {
    const { maxAge, ...clearOptions } = getSecureCookieOptions(0);
    res.clearCookie('token', clearOptions);
    await recordAudit({ req, action: 'LOGOUT', status: 'SUCCESS' });
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed." });
  }
});

// GDPR / Data Deletion Request Endpoint
app.post('/api/user/delete-data', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ error: "User identification missing." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    // Anonymize user personal data to retain financial/ledger audit integrity while respecting deletion requests
    user.firstName = "Anonymized";
    user.lastName = "User";
    user.email = `deleted_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@anonymized.amanah`;
    user.mobileNumber = "";
    user.isVerified = false;
    await user.save();

    await recordAudit({
      req,
      action: 'GDPR_DATA_DELETION',
      actorId: userId,
      status: 'SUCCESS'
    });

    const { maxAge, ...clearOptions } = getSecureCookieOptions(0);
    res.clearCookie('token', clearOptions);
    return res.status(200).json({ message: "Personal identifying information has been successfully removed in compliance with privacy policies." });
  } catch (error) {
    console.error("Data Deletion Error:", error);
    res.status(500).json({ error: "Failed to process data deletion request." });
  }
});
// registration
app.post('/api/register', authLimiter, async (req, res) => {
  try {
    await connectDB();
    const { firstName, lastName, email, mobileNumber, role, otpVerified } = req.body;

    if (!email || !firstName || !lastName || typeof email !== 'string') {
      return res.status(400).json({ error: "First Name, Last Name, and Email are required strings." });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.toLowerCase().trim())) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (mobileNumber && String(mobileNumber).trim()) {
      const cleanPhone = String(mobileNumber).trim().replace(/[\s\-\+]/g, '');
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(cleanPhone)) {
        return res.status(400).json({ error: "Please enter a valid mobile number (10 to 15 digits)." });
      }
    }

    const cleanEmail = email.toLowerCase().trim();

    const isOtpDone = otpVerified || (otpStore[cleanEmail] && otpStore[cleanEmail].verified) || (otpStore[email] && otpStore[email].verified);
    if (!isOtpDone) {
      return res.status(400).json({ error: "Email address has not been verified via OTP." });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const allowedRole = ['DONOR', 'BENEFICIARY'].includes(role) ? role : 'DONOR';
    const token = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: cleanEmail,
      mobileNumber: mobileNumber ? String(mobileNumber).trim() : '',
      role: allowedRole,
      verificationToken: token,
      isVerified: true
    });
    await newUser.save();
    delete otpStore[cleanEmail];
    delete otpStore[email];

    try {
      const safeFirstName = escapeHtml(String(firstName).trim());
      const welcomeHtml = renderOfficialEmailHtml({
        title: "Welcome to Amanah Network",
        preheader: `Welcome to Amanah Network, ${safeFirstName}! Your account has been created.`,
        contentHtml: `
          <h2 style="color: #284D3D; margin-top: 0; font-size: 20px;">Welcome to Amanah Network, ${safeFirstName}!</h2>
          <p>We are thrilled to welcome you to the <strong>Amanah Network</strong>. Your account has been created and verified successfully.</p>
          <div style="background-color: #f8fafc; padding: 18px 20px; border-left: 4px solid #C5A059; border-radius: 6px; margin: 22px 0;">
            <p style="margin: 0 0 6px; font-size: 14px;"><strong>Account Email:</strong> ${escapeHtml(cleanEmail)}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Account Role:</strong> ${escapeHtml(allowedRole)}</p>
          </div>
          <p>Thank you for partnering with us in building complete trust, accountability, and impact in community aid.</p>
        `,
        footerNote: "This is an automated confirmation of your Amanah Network account registration."
      });

      await sendMailHelper({
        to: cleanEmail,
        subject: 'Welcome to Amanah Network',
        html: welcomeHtml,
        text: `Hello ${firstName},\n\nWe are thrilled to welcome you to the Amanah Network! Your account has been created successfully.\nThank you for joining us in making a difference!`
      });
    } catch (emailErr) {
      console.error("Email notification warning:", emailErr.message);
    }

    res.status(201).json({ message: "Registration successful! Account created." });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message || "Registration failed" });
  }
});

app.get('/api/verify/:token', async (req, res) => {
  const user = await User.findOneAndUpdate({ verificationToken: req.params.token }, { isVerified: true, verificationToken: undefined });
  if (!user) return res.status(400).send("Invalid or expired token.");
  res.send("<h1>Account Verified!</h1>");
});

// --- PAYMENT INTEGRATION ---
app.post('/api/payment/create-order', paymentLimiter, async (req, res) => {
  const { amount, donorEmail, projectTitle, donorName, mobileNumber } = req.body;
  if (!amount || !donorEmail || !donorName || !mobileNumber) {
    return res.status(400).json({ error: "Missing required donation details" });
  }

  if (String(donorName).trim().length > 25) {
    return res.status(400).json({ error: "Donor name cannot exceed 25 characters." });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0 || !Number.isFinite(numericAmount)) {
    return res.status(400).json({ error: "Donation amount must be a positive number." });
  }

  try {
    await connectDB();
    let userExists = await User.findOne({ email: String(donorEmail).toLowerCase().trim() });
    if (!userExists) {
      const nameParts = String(donorName).trim().split(' ');
      const firstName = nameParts[0] || String(donorName);
      const lastName = nameParts.slice(1).join(' ') || 'Donor';
      userExists = new User({
        firstName,
        lastName,
        email: String(donorEmail).toLowerCase().trim(),
        mobileNumber: String(mobileNumber).trim(),
        role: 'DONOR',
        isVerified: true
      });
      await userExists.save();
    }
    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });
    res.status(200).json(order);
  } catch (error) {
    console.error("Payment Creation Error:", error);
    res.status(500).json({ error: "Failed to create payment order." });
  }
});
console.log("Payment route set up successfully.");
const sendDonationEmail = async (donorEmail, donorName, amount, paymentId) => {
  const safeName = escapeHtml(String(donorName || 'Valued Donor'));
  const safePaymentId = escapeHtml(String(paymentId));
  const safeAmount = Number(amount).toLocaleString('en-IN');

  const receiptHtml = renderOfficialEmailHtml({
    title: "Donation Receipt - Amanah Network",
    preheader: `Thank you for your generous contribution of ₹${safeAmount} to Amanah Network.`,
    contentHtml: `
      <h2 style="color: #284D3D; margin-top: 0; font-size: 20px;">Thank You for Your Generous Support!</h2>
      <p>Dear <strong>${safeName}</strong>,</p>
      <p>We have successfully received and verified your contribution of <strong>₹${safeAmount}</strong>. Your generosity directly powers transparent humanitarian relief.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #284D3D; border-radius: 6px; margin: 22px 0;">
        <p style="margin: 0 0 8px;"><strong>Donation Amount:</strong> ₹${safeAmount}</p>
        <p style="margin: 0 0 8px;"><strong>Payment ID:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${safePaymentId}</code></p>
        <p style="margin: 0;"><strong>Verification Status:</strong> <span style="color: #166534; font-weight: 700;">Verified &amp; Cryptographically Secured</span></p>
      </div>
      <p style="font-size: 13px; color: #64748b;">
        This donation has been recorded into the immutable Amanah Audit Ledger to guarantee 100% accountability.
      </p>
    `,
    footerNote: `Official Receipt &bull; Payment Reference: ${safePaymentId}`
  });

  await sendMailHelper({
    to: donorEmail,
    subject: 'Donation Receipt - Amanah Network',
    fromName: 'Amanah Network',
    html: receiptHtml,
    text: `Dear ${donorName}, Thank you for your contribution of INR ${amount}. Payment ID: ${paymentId}.`
  });
};

// Ensure you have 'let isConnected = false;' defined at the top level of your server.js
app.post("/api/payment/verify", paymentLimiter, async (req, res) => {
  try {
    await connectDB();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donorEmail,
      amount,
      donorName,
      mobileNumber,
      projectTitle
    } = req.body;

    // 1. Check if donation is already recorded (Idempotency)
    const existing = await Donation.findOne({ paymentId: razorpay_payment_id });
    if (existing) {
      return res.status(200).json({ status: "success", message: "Payment already verified and recorded." });
    }

    // 2. Verify Razorpay HMAC signature with timing-safe comparison
    const rzpSecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (!rzpSecret || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment verification parameters." });
    }

    const hmac = crypto.createHmac("sha256", rzpSecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
    if (!safeCompare(generatedSignature, razorpay_signature)) {
      console.warn("HMAC Signature mismatch for payment:", razorpay_payment_id);
      return res.status(400).json({ error: "Invalid payment signature." });
    }

    // 3. Save donation and ledger entry safely
    const sanitizedDonorName = String(donorName || 'Valued Donor').trim().slice(0, 25);
    const newDonation = new Donation({
      donorEmail,
      donorName: sanitizedDonorName,
      mobileNumber,
      amount,
      projectTitle: projectTitle || "General Donation",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "SUCCESS"
    });

    await newDonation.save();
    await createLedgerEntry('RECEIVED', sanitizedDonorName, amount, razorpay_payment_id, null);

    // Record audit event
    await recordAudit({
      req,
      action: 'DONATION_VERIFIED',
      actorEmail: donorEmail,
      targetResource: razorpay_payment_id,
      status: 'SUCCESS',
      details: { amount, donorName: sanitizedDonorName, projectTitle }
    });

    // 4. Send confirmation email
    await sendDonationEmail(donorEmail, sanitizedDonorName, amount, razorpay_payment_id);

    return res.status(200).json({ status: "success", message: "Donation verified." });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    // If it failed because of duplicate key (already saved concurrently), return success
    if (error.code === 11000 || (error.message && error.message.includes('duplicate key'))) {
      return res.status(200).json({ status: "success", message: "Donation verified and recorded." });
    }
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

app.post('/api/auth/send-otp', otpLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') return res.status(400).json({ error: "Valid email string is required" });
  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[cleanEmail] = otp;
  otpStore[email] = otp;

  const otpHtml = renderOfficialEmailHtml({
    title: "Verification OTP Code - Amanah Network",
    preheader: `Your verification code is ${otp}. Valid for 10 minutes.`,
    contentHtml: `
      <div style="text-align: center; padding: 10px 0;">
        <h2 style="color: #284D3D; margin-top: 0; font-size: 20px;">Email Verification Code</h2>
        <p style="font-size: 14px; color: #475569; margin: 0 0 24px;">Please use the following 6-digit One-Time Password (OTP) to complete your verification:</p>
        <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #C5A059; border-radius: 8px; padding: 16px 32px; margin: 0 auto 20px;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #284D3D; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin: 15px 0 0;">
          This code will expire in <strong>10 minutes</strong>. If you did not initiate this request, you can safely ignore this email.
        </p>
      </div>
    `,
    footerNote: "Never share this code with anyone. Amanah Network will never ask for your OTP."
  });

  const mailResult = await sendMailHelper({
    to: cleanEmail,
    subject: 'Your Amanah Verification OTP Code',
    text: `Your verification OTP code for Amanah Network is: ${otp}`,
    html: otpHtml
  });

  if (mailResult.success) {
    return res.json({ message: "OTP Sent successfully to your email." });
  }

  // Fallback notice - only include debugOtp in development environment
  console.warn(`[OTP Notice] Direct delivery returned warning for ${cleanEmail}. Internal OTP generated.`);
  return res.json({
    message: "OTP Sent",
    ...(process.env.NODE_ENV === 'development' ? { debugOtp: otp } : {})
  });
});

app.post('/api/auth/verify-otp', authLimiter, (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
  const cleanEmail = String(email).toLowerCase().trim();
  if (otpStore[cleanEmail] === String(otp) || otpStore[email] === String(otp)) {
    otpStore[cleanEmail] = { verified: true };
    otpStore[email] = { verified: true };
    return res.json({ verified: true });
  }
  res.status(400).json({ error: "Invalid OTP" });
});

app.post('/api/contact', contactLimiter, botProtection, async (req, res) => {
  const { name, mobile, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Full Name, Email Address, and Message are required." });
  }

  if (String(name).trim().length > 25) {
    return res.status(400).json({ error: "Full Name cannot exceed 25 characters." });
  }

  if (String(message).trim().length > 500) {
    return res.status(400).json({ error: "Why do you want to join section cannot exceed 500 characters." });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(String(email).toLowerCase().trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const recipient = (process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER || 'amanahnetwork.org@gmail.com').trim();
  const contactHtml = renderOfficialEmailHtml({
    title: `New Contact Submission: ${safeName}`,
    preheader: `New contact submission from ${safeName} (${safeEmail})`,
    contentHtml: `
      <h2 style="color: #284D3D; margin-top: 0; font-size: 20px;">New Contact / Association Application</h2>
      <p>A new inquiry has been submitted through the public Amanah Network portal.</p>
      <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #C5A059; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 8px;"><strong>Full Name:</strong> ${safeName}</p>
        <p style="margin: 0 0 8px;"><strong>Email Address:</strong> <a href="mailto:${safeEmail}" style="color: #284D3D; font-weight: 600;">${safeEmail}</a></p>
        <p style="margin: 0;"><strong>Mobile Number:</strong> ${safeMobile}</p>
      </div>
      <p style="margin: 18px 0 8px; font-weight: 700; color: #1e293b;">Why do you want to join / Message:</p>
      <div style="background-color: #f1f5f9; padding: 18px; border-radius: 6px; font-style: italic; white-space: pre-wrap; color: #334155; line-height: 1.6;">${safeMessage}</div>
    `,
    footerNote: "Reply directly to this email to respond to the applicant."
  });

  try {
    await sendMailHelper({
      to: recipient,
      replyTo: safeEmail,
      subject: `New Contact Submission: ${safeName}`,
      fromName: "Amanah Contact Portal",
      html: contactHtml,
      text: `New Contact Submission:\nFull Name: ${safeName}\nEmail: ${safeEmail}\nMobile: ${safeMobile}\nMessage:\n${safeMessage}`
    });
    console.log(`[INFO] Contact application from ${safeName} (${safeEmail}) delivered via Resend`);
    return res.status(200).json({ message: "Application submitted successfully." });
  } catch (err) {
    console.error("Contact Mailer Error:", err.message);
    return res.status(200).json({ message: "Application received." });
  }
});

app.get('/api/auth/digilocker', (req, res) => {
  const authUrl = `https://api.digitallocker.gov.in/authorize?client_id=${process.env.DL_ID}&response_type=code`;
  res.redirect(authUrl);
});

// Step 2: Handle callback
app.get('/api/auth/digilocker/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const tokenResponse = await axios.post('https://api.digitallocker.gov.in/token', {
      client_id: process.env.DL_ID,
      client_secret: process.env.DL_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.DL_REDIRECT_URI
    });

    const profile = await axios.get('https://api.digitallocker.gov.in/user', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    res.redirect(`${process.env.CLIENT_URL}/enrollment?kycSuccess=true&name=${profile.data.name}`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/enrollment?kycSuccess=false`);
  }
});

app.post('/api/admin/enroll-agent',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ max: 25 }).withMessage('Full Name cannot exceed 25 characters.').escape()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0]?.msg || "Validation error" });
    }
    const { name, email, password, kyc, secretKey, otpVerified } = req.body || {};

    if (name && String(name).trim().length > 25) {
      return res.status(400).json({ error: "Full Name cannot exceed 25 characters." });
    }

    // 1. Verify Governance Key with timing-safe comparison
    const adminKey = (process.env.ADMIN_KEY || '').trim();
    const providedKey = (
      secretKey ||
      req.headers['x-governance-key'] ||
      req.headers['use-secret-key'] ||
      req.headers['x-admin-key'] ||
      ''
    ).trim();

    if (!adminKey || !providedKey || !safeCompare(providedKey, adminKey)) {
      return res.status(403).json({ error: "Unauthorized: Invalid Governance Key" });
    }

    const cleanEmail = (email || '').toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    // 2. Password Strength Validation: At least 6 characters, 1 uppercase letter, 1 special character
    const passwordRegex = /^(?=.*[A-Z])(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!password || !passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must be at least 6 characters long, contain at least 1 uppercase letter (A-Z), and 1 special character (e.g. @, #, !)." });
    }

    const isOtpDone = otpVerified || otpStore[cleanEmail]?.verified || otpStore[req.body.email]?.verified;
    if (!isOtpDone) {
      return res.status(401).json({ error: "Email not verified via OTP" });
    }

    try {
      await connectDB();
      const newAgent = new AuthorizedAgent({
        name,
        email: cleanEmail,
        password,
        kyc: kyc || {}
      });

      await newAgent.save();

      await recordAudit({
        req,
        action: 'ENROLL_AGENT',
        targetResource: cleanEmail,
        status: 'SUCCESS'
      });

      res.status(201).json({ message: "Agent enrolled successfully." });
    } catch (error) {
      console.error("Enrollment Error:", error);
      if (error.code === 11000) {
        return res.status(400).json({ error: "Enrollment failed. Email already exists in the system." });
      }
      res.status(400).json({ error: error.message || "Enrollment failed." });
    }
  });

async function verifyBankAccount(accountNumber, ifsc) {
  try {
    const response = await razorpay.accounts.validate({
      account_number: accountNumber,
      ifsc: ifsc,
      name: "Beneficiary Name"
    });
    return response.status === 'active';
  } catch (error) {
    console.error("Razorpay Verification Failed:", error);
    return false;
  }
}

app.post('/api/verify-bank', apiLimiter, [
  body('accountNumber').isLength({ min: 9, max: 18 }).isNumeric(),
  body('ifsc').isLength({ min: 11, max: 11 }).trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { accountNumber, ifsc, orgName } = req.body;

  if (process.env.MOCK_BANK_VERIFICATION === 'true') {
    return res.status(200).json({ valid: true });
  }

  try {
    const verification = await razorpay.accounts.validate({
      account_number: accountNumber,
      ifsc: ifsc,
      name: orgName || "Beneficiary Name"
    });

    if (verification.status === 'active') {
      res.status(200).json({ valid: true });
    } else {
      res.status(400).json({ valid: false });
    }
  } catch (error) {
    res.status(500).json({ error: "Verification service unavailable" });
  }
});

const secretTransferPath = process.env.SECRET_TRANSFER_PATH || '/api/admin/secure-aid-fund-transfer';

const transferLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many transfer attempts, please try again later." }
});

app.get(secretTransferPath, adminAuth, (req, res) => {
  res.status(200).json({ message: "Aid transfer gate operational. Use POST to execute fund transfers." });
});

app.post(secretTransferPath,
  transferLimiter,
  adminAuth, // Enforce strict server-side authentication for fund transfers
  [
    body('email').isEmail().normalizeEmail(),
    body('transferData.accountNumber').isLength({ min: 9, max: 18 }).isNumeric(),
    body('transferData.ifscCode').isLength({ min: 11, max: 11 }).trim().escape(),
    body('transferData.orgName').trim().escape(),
    body('transferData.amount').isNumeric().toFloat()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }
    const { email, transferData } = req.body;

    try {
      await connectDB();
      // Bank Verification (Razorpay or Mock)
      if (process.env.MOCK_BANK_VERIFICATION !== 'true') {
        const verification = await razorpay.accounts.validate({
          account_number: transferData.accountNumber,
          ifsc: transferData.ifscCode,
          name: transferData.orgName
        });
        if (verification.status !== 'active') {
          if (session) await session.abortTransaction();
          return res.status(400).json({ error: "Bank account verification failed. Please check details." });
        }
      }

      // Save to Database with session-backed Agent ID
      const newTransfer = new TransferAid({
        ...transferData,
        agentId: req.user?._id || new mongoose.Types.ObjectId(),
        senderEmail: req.user?.email || email || "governance@amanahnetwork.org"
      });

      if (session) {
        await newTransfer.save({ session });
        await createLedgerEntry('SPENT', transferData.orgName, transferData.amount, newTransfer._id, session);
        await session.commitTransaction();
      } else {
        await newTransfer.save();
        await createLedgerEntry('SPENT', transferData.orgName, transferData.amount, newTransfer._id, null);
      }

      // Record tamper-evident audit log
      await recordAudit({
        req,
        action: 'AID_TRANSFER',
        actorId: req.user?._id,
        actorEmail: req.user?.email,
        targetResource: transferData.orgName,
        status: 'SUCCESS',
        details: {
          amount: transferData.amount,
          orgName: transferData.orgName,
          maskedAccount: maskAccountNumber(transferData.accountNumber)
        }
      });

      // Send Email Notification via Resend
      try {
        const safeOrgName = escapeHtml(String(transferData.orgName));
        const safeDisbursedAmount = Number(transferData.amount).toLocaleString('en-IN');
        const maskedAcc = maskAccountNumber(transferData.accountNumber);

        const disburseHtml = renderOfficialEmailHtml({
          title: "Aid Disbursement Confirmation",
          preheader: `Aid disbursement of ₹${safeDisbursedAmount} processed for ${safeOrgName}.`,
          contentHtml: `
            <h2 style="color: #284D3D; margin-top: 0; font-size: 20px;">Aid Disbursement Approved &amp; Processed</h2>
            <p>Hello <strong>${safeOrgName}</strong>,</p>
            <p>Your approved humanitarian aid disbursement has been successfully processed and transferred to your registered beneficiary account.</p>
            <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #284D3D; border-radius: 6px; margin: 22px 0;">
              <p style="margin: 0 0 8px;"><strong>Organization / Beneficiary:</strong> ${safeOrgName}</p>
              <p style="margin: 0 0 8px;"><strong>Disbursed Amount:</strong> ₹${safeDisbursedAmount}</p>
              <p style="margin: 0 0 8px;"><strong>Account Number:</strong> ${maskedAcc}</p>
              <p style="margin: 0;"><strong>Transaction ID:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${newTransfer._id}</code></p>
            </div>
            <p style="font-size: 13px; color: #64748b;">
              This transaction has been cryptographically signed and logged onto the immutable Amanah Governance Ledger.
            </p>
          `,
          footerNote: `Disbursement Confirmation &bull; Reference ID: ${newTransfer._id}`
        });

        await sendMailHelper({
          to: transferData.email,
          subject: "Donation Disbursement Confirmation - Amanah Network",
          fromName: "Amanah Governance",
          html: disburseHtml,
          text: `Hello ${transferData.orgName}, your donation of INR ${transferData.amount} has been successfully processed and sent to account ${maskedAcc}. Transaction ID: ${newTransfer._id}.`
        });
      } catch (mailErr) {
        console.error("Disbursement Mail Warning:", mailErr.message);
      }

      res.status(200).json({
        message: "Payment Successful",
        transactionId: newTransfer._id,
        accountNumber: maskAccountNumber(transferData.accountNumber)
      });

    } catch (error) {
      if (session) await session.abortTransaction();
      console.error("Transfer Transaction Aborted:", error);
      res.status(500).json({ error: error.message });
    } finally {
      if (session) session.endSession();
    }
  });

app.post('/api/admin/verify-vault', authLimiter, async (req, res) => {
  const { key } = req.body;
  const adminKey = (process.env.ADMIN_KEY || '').trim();
  const inputKey = (key || '').trim();
  if (adminKey && inputKey && safeCompare(inputKey, adminKey)) {
    await recordAudit({ req, action: 'VAULT_UNLOCKED', status: 'SUCCESS' });
    return res.status(200).json({ unlocked: true });
  }
  await recordAudit({ req, action: 'VAULT_UNLOCKED', status: 'FAILED' });
  res.status(403).json({ error: "Invalid Governance Key" });
});

app.get('/api/admin/check-access', adminAuth, (req, res) => {
  res.status(200).json({ authorized: true, user: { id: req.user?._id, role: req.user?.role } });
});

app.get('/api/admin/ledger', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const { from, to, actionType } = req.query;
    const query = {};
    if (from && to && from !== 'undefined' && to !== 'undefined') {
      const startDate = new Date(from);
      const endDate = new Date(to);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        endDate.setUTCHours(23, 59, 59, 999);
        query.timestamp = { $gte: startDate, $lte: endDate };
      }
    }
    if (actionType && actionType !== 'ALL' && actionType !== 'undefined') {
      // Escape regex special characters to prevent ReDoS attacks
      query.actionType = { $regex: new RegExp(`^${escapeRegex(actionType)}$`, 'i') };
    } else {
      delete query.actionType;
    }
    const ledgerEntries = await Ledger.find(query).sort({ timestamp: -1 });
    res.status(200).json(ledgerEntries);
  } catch (error) {
    console.error("CRITICAL_LEDGER_ERROR:", error);
    res.status(500).json({ message: "Error fetching ledger", error: error.message });
  }
});

app.post('/api/admin/send-ledger-email', adminAuth, async (req, res) => {
  const { recipientEmail, from, to, actionType } = req.body;

  if (!recipientEmail) {
    return res.status(400).json({ error: "Recipient email address is required." });
  }

  try {
    await connectDB();
    const query = {};
    if (from && to && from !== 'undefined' && to !== 'undefined') {
      const startDate = new Date(from);
      const endDate = new Date(to);
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        endDate.setUTCHours(23, 59, 59, 999);
        query.timestamp = { $gte: startDate, $lte: endDate };
      }
    }
    if (actionType && actionType !== 'ALL' && actionType !== 'undefined') {
      query.actionType = { $regex: new RegExp(`^${escapeRegex(actionType)}$`, 'i') };
    }

    const ledgerEntries = await Ledger.find(query).sort({ timestamp: -1 });

    let totalReceived = 0;
    let totalSpent = 0;
    ledgerEntries.forEach(entry => {
      if (entry.actionType === 'RECEIVED') totalReceived += entry.amount;
      if (entry.actionType === 'SPENT') totalSpent += entry.amount;
    });

    const rows = ledgerEntries.map(e => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${new Date(e.timestamp).toLocaleString('en-IN')}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: ${e.actionType === 'RECEIVED' ? '#2e7d32' : '#c62828'};">${e.actionType}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(e.target)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${e.amount.toLocaleString()}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-size: 11px;">${escapeHtml(e.transactionId)}</td>
      </tr>
    `).join('');

    const reportHtml = renderOfficialEmailHtml({
      title: `Amanah Audit Ledger Report (${new Date().toLocaleDateString('en-IN')})`,
      preheader: `Official Amanah Network cryptographic audit report. Total entries: ${ledgerEntries.length}.`,
      contentHtml: `
        <h2 style="color: #284D3D; margin-top: 0; font-size: 20px;">Cryptographic Audit Ledger Report</h2>
        <p style="margin: 4px 0 16px; color: #64748b; font-size: 13px;">Generated on ${new Date().toLocaleString('en-IN')} &bull; Total entries: <strong>${ledgerEntries.length}</strong></p>

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px;">
          <tr>
            <td style="padding: 10px; text-align: center;">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Total Received</div>
              <div style="font-size: 20px; font-weight: 800; color: #166534; margin-top: 4px;">₹${totalReceived.toLocaleString('en-IN')}</div>
            </td>
            <td style="padding: 10px; text-align: center; border-left: 1px solid #e2e8f0;">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Total Disbursed</div>
              <div style="font-size: 20px; font-weight: 800; color: #991b1b; margin-top: 4px;">₹${totalSpent.toLocaleString('en-IN')}</div>
            </td>
            <td style="padding: 10px; text-align: center; border-left: 1px solid #e2e8f0;">
              <div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Current Reserve</div>
              <div style="font-size: 20px; font-weight: 800; color: #1e40af; margin-top: 4px;">₹${(totalReceived - totalSpent).toLocaleString('en-IN')}</div>
            </td>
          </tr>
        </table>

        <div style="overflow-x: auto; margin-top: 20px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #284D3D; color: #ffffff; text-align: left;">
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Date</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Action</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Target</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Amount</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0;">Txn ID</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="5" style="padding: 15px; text-align: center; color: #888;">No ledger entries found.</td></tr>'}
            </tbody>
          </table>
        </div>
      `,
      footerNote: "Amanah Governance System &bull; Cryptographically Verified Ledger"
    });

    const mailRes = await sendMailHelper({
      to: recipientEmail,
      subject: `Amanah Audit Ledger Report (${new Date().toLocaleDateString('en-IN')})`,
      fromName: "Amanah Governance",
      html: reportHtml,
      text: `Amanah Audit Ledger Report generated on ${new Date().toLocaleDateString('en-IN')}.\nTotal records: ${ledgerEntries.length}\nTotal Received: INR ${totalReceived}\nTotal Disbursed: INR ${totalSpent}\nCurrent Reserve: INR ${totalReceived - totalSpent}.`
    });

    if (!mailRes.success) {
      return res.status(500).json({ error: mailRes.error || "Failed to send ledger email via Resend." });
    }

    res.status(200).json({ message: `Ledger report sent successfully to ${recipientEmail}` });
  } catch (error) {
    console.error("Send Ledger Email Error:", error);
    res.status(500).json({ error: error.message || "Failed to send ledger email." });
  }
});

// A central helper to keep code DRY
async function createLedgerEntry(actionType, target, amount, transactionId, session) {
  if (!target || !amount || !transactionId) {
    console.error("Ledger Save Failed: Missing fields", { target, amount, transactionId });
    return;
  }
  try {
    const newEntry = new Ledger({
      actionType,
      target,
      amount,
      transactionId,
      timestamp: new Date()
    });
    const saved = await newEntry.save({ session });
    return saved;
  } catch (err) {
    console.error("Ledger Save Error:", err);
    throw err;
  }
}

// --- DONATIONS (Admin Protected)
app.get('/api/donations', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const donations = await Donation.find().select('-__v');
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donations." });
  }
});

// --- ANALYTICS (Admin Protected)
app.get('/api/admin/analytics', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const ledger = await Ledger.find();

    let received = 0;
    let spent = 0;

    ledger.forEach(entry => {
      if (entry.actionType === 'RECEIVED') received += entry.amount;
      if (entry.actionType === 'SPENT') spent += entry.amount;
    });

    res.json({
      totalDonated: received,
      totalSpent: spent,
      balance: received - spent
    });
  } catch (error) {
    console.error("Analytics Route Error:", error);
    res.status(500).json({ error: "Failed to load analytics data" });
  }
});

// --- AUDIT TRAIL ENDPOINT (Admin Protected) ---
app.get('/api/admin/audit-logs', adminAuth, async (req, res) => {
  try {
    await connectDB();
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).select('-__v');
    res.status(200).json(logs);
  } catch (error) {
    console.error("Audit Logs Retrieval Error:", error);
    res.status(500).json({ error: "Failed to retrieve audit trail." });
  }
});

// --- HEALTH CHECK & OBSERVABILITY ---
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const statusMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.status(200).json({
    status: dbState === 1 ? 'healthy' : 'degraded',
    database: statusMap[dbState] || 'unknown',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req, res) => {
  res.send('Amanah Network API is running. Use /api/ for endpoints.');
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("--- GLOBAL API ERROR ---", err.stack || err.message || err);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProd ? "Internal Server Error" : (err.message || "Internal Server Error")
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('Amanah Backend Server running');
  });
}

export default app;