// REPLACE ALL 'require' WITH 'import'
import 'dotenv/config';
import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) { }
try { dns.setDefaultResultOrder('ipv4first'); } catch (e) { }
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
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
import mongoSanitize from 'express-mongo-sanitize';
// Keep your imports for internal files
import adminAuth from '../middleware/adminAuth.js'; // Note: Must include .js extension
import Ledger from '../models/Ledger.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import TransferAid from '../models/TransferAid.js';
import AuthorizedAgent from '../models/AuthorizedAgent.js';

const app = express();
app.set('trust proxy', 1);
const otpStore = {};
let isConnecting = false;

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
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: "deny" }
}));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size
app.use(mongoSanitize()); // Prevent NoSQL Injection attacks

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
// Middleware for every sensitive API route
const secureApiGuard = (req, res, next) => {
  const secretKey = req.headers['x-governance-key'];
  const adminKey = (process.env.ADMIN_KEY || '').trim();
  if (secretKey && secretKey.trim() === adminKey) {
    return next();
  }
  console.log("SecureApiGuard blocked this request.");
  res.status(403).json({ error: "Access Denied" });
};
// --- MAIL TRANSPORTER SETUP ---
const getTransporter = () => {
  const user = (process.env.EMAIL_USER || '').trim();
  const pass = (process.env.EMAIL_PASS || '').trim();
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
};
const transporter = getTransporter();
transporter.verify((error, success) => {
  if (error) {
    console.error("[ERROR] Email Transporter Error:", error);
  } else {
    console.log("[INFO] Email Transporter is ready to send messages");
  }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication requests. Please try again in 15 minutes." }
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
  max: 60,
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
    const newAdmin = new User({
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).toLowerCase().trim(),
      mobileNumber: mobileNumber ? String(mobileNumber).trim() : '',
      role: 'ADMIN',
      isVerified: true
    });
    await newAdmin.save();
    res.status(201).json({ message: "Admin member created successfully." });
  } catch (error) {
    res.status(400).json({ error: "Failed to create admin member." });
  }
});

// --- AUTH & REGISTRATION ---
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: "Email and password are required strings." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check AuthorizedAgent collection (Agent / Board Member logins)
    const agent = await AuthorizedAgent.findOne({ email: cleanEmail });
    if (agent && agent.password) {
      const isMatch = await bcrypt.compare(password, agent.password);
      if (isMatch) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          return res.status(500).json({ error: "Server Configuration Error: JWT_SECRET missing" });
        }
        const token = jwt.sign({ id: agent._id, role: 'AGENT' }, jwtSecret, { expiresIn: '1h' });
        res.cookie('token', token, getSecureCookieOptions(3600000));
        return res.status(200).json({
          message: "Logged in successfully",
          user: { id: agent._id, name: agent.name, email: agent.email, role: 'AGENT' }
        });
      }
    }

    // 2. Check User collection
    const user = await User.findOne({ email: cleanEmail });
    if (user) {
      let isMatch = false;
      if (user.password) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = true;
      }

      if (isMatch) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
          return res.status(500).json({ error: "Server Configuration Error: JWT_SECRET missing" });
        }
        const token = jwt.sign({ id: user._id, role: user.role || 'USER' }, jwtSecret, { expiresIn: '1h' });
        res.cookie('token', token, getSecureCookieOptions(3600000));
        return res.status(200).json({
          message: "Logged in successfully",
          user: { id: user._id, name: `${user.firstName} ${user.lastName}`, email: user.email, role: user.role }
        });
      }
    }

    return res.status(401).json({ error: "Invalid Credentials" });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Auth Error." });
  }
});

// Logout endpoint with secure cookie clearing
app.post('/api/auth/logout', (req, res) => {
  try {
    const { maxAge, ...clearOptions } = getSecureCookieOptions(0);
    res.clearCookie('token', clearOptions);
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
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await transporter.sendMail({
          from: `"Amanah Support" <${process.env.EMAIL_USER}>`,
          to: cleanEmail,
          subject: 'THANKS FOR REGISTERING WITH AMANAH',
          text: `Hello ${firstName},\n\nWe are thrilled to welcome you to the Amanah Network! Your account has been created successfully.\nThank you for joining us in making a difference!`,
        });
      }
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
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  const safeName = escapeHtml(String(donorName || 'Valued Donor'));
  const safePaymentId = escapeHtml(String(paymentId));
  const safeAmount = Number(amount).toLocaleString('en-IN');

  if (emailUser && emailPass) {
    try {
      const mailer = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
      });
      await mailer.sendMail({
        from: `"Amanah Network" <${emailUser}>`,
        to: donorEmail,
        subject: 'Donation Receipt - Amanah Network',
        html: `
          <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #284D3D; margin-top: 0;">Thank You for Your Donation!</h2>
            <p>Dear <strong>${safeName}</strong>,</p>
            <p>We have successfully received your contribution of <strong>₹${safeAmount}</strong>. Thank you for supporting the Amanah Network!</p>
            <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #284D3D; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Donation Amount:</strong> ₹${safeAmount}</p>
              <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${safePaymentId}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> Success & Verified</p>
            </div>
            <p style="font-size: 12px; color: #718096;">Logged in the Amanah Audit Ledger.</p>
          </div>
        `
      });
      console.log(`Donation receipt email sent to ${donorEmail}`);
    } catch (err) {
      console.error("Donation Email Error:", err.message);
    }
  }

  if (resend) {
    try {
      await resend.emails.send({
        from: 'Amanah Foundation <onboarding@resend.dev>',
        to: donorEmail,
        subject: 'Donation Received!',
        html: `<h1>Thank you!</h1><p>We received your donation of ₹${amount}. Payment ID: ${paymentId}</p>`
      });
    } catch (err) {
      console.error("Resend Error:", err.message);
    }
  }
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

    // 1. Check if donation is already recorded
    const existing = await Donation.findOne({ paymentId: razorpay_payment_id });
    if (existing) {
      return res.status(200).json({ status: "success", message: "Payment already verified and recorded." });
    }

    // 2. Verify Razorpay HMAC signature if secret is present
    const rzpSecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    if (rzpSecret && razorpay_order_id && razorpay_signature) {
      const hmac = crypto.createHmac("sha256", rzpSecret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generatedSignature = hmac.digest("hex");
      if (generatedSignature !== razorpay_signature) {
        console.warn("HMAC Signature mismatch:", { generatedSignature, razorpay_signature });
        return res.status(400).json({ error: "Invalid payment signature." });
      }
    }

    // 3. Save donation and ledger entry safely
    const newDonation = new Donation({
      donorEmail,
      donorName,
      mobileNumber,
      amount,
      projectTitle: projectTitle || "General Donation",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "SUCCESS"
    });

    await newDonation.save();
    await createLedgerEntry('RECEIVED', donorName, amount, razorpay_payment_id, null);

    // 4. Send confirmation email
    await sendDonationEmail(donorEmail, donorName, amount, razorpay_payment_id);

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
app.post('/api/auth/send-otp', authLimiter, async (req, res) => {
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

  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  if (!emailUser || !emailPass) {
    console.warn("[WARNING] EMAIL_USER or EMAIL_PASS missing. OTP generated internally.");
    return res.json({ message: "OTP Sent" }); // NEVER expose debugOtp to client
  }

  try {
    const mailer = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });
    await mailer.sendMail({
      from: `"Amanah Support" <${emailUser}>`,
      to: cleanEmail,
      subject: 'Your Amanah Verification OTP Code',
      text: `Your verification OTP code for Amanah Network is: ${otp}`,
      html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; max-width: 480px; margin: 0 auto; text-align: center;">
        <h2 style="color: #284D3D;">Amanah Network</h2>
        <p style="font-size: 14px;">Your 6-digit OTP code for registration is:</p>
        <h1 style="font-size: 32px; letter-spacing: 6px; color: #284D3D; background: #f4f4f4; padding: 10px; border-radius: 4px;">${otp}</h1>
        <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this message.</p>
      </div>`
    });
    return res.json({ message: "OTP Sent" });
  } catch (err) {
    console.error("OTP Mail Error:", err.message);
    return res.json({ message: "OTP Sent" });
  }
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

app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, mobile, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Full Name, Email Address, and Message are required." });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(String(email).toLowerCase().trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  const adminEmail = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').trim();

  const safeName = escapeHtml(String(name).trim());
  const safeEmail = escapeHtml(String(email).trim());
  const safeMobile = mobile ? escapeHtml(String(mobile).trim()) : 'N/A';
  const safeMessage = escapeHtml(String(message).trim());

  if (adminEmail && emailPass) {
    try {
      const mailer = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: adminEmail, pass: emailPass }
      });

      await mailer.sendMail({
        from: `"Amanah Contact Form" <${adminEmail}>`,
        to: adminEmail,
        replyTo: safeEmail,
        subject: `New Contact Submission: ${safeName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #284D3D; margin-top: 0;">New Contact Application Details</h2>
            <p><strong>Full Name:</strong> ${safeName}</p>
            <p><strong>Email Address:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            <p><strong>Mobile Number:</strong> ${safeMobile}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p><strong>Why do you want to join?</strong></p>
            <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #284D3D; font-style: italic; white-space: pre-wrap;">${safeMessage}</div>
          </div>
        `
      });
      console.log(`Contact application from ${safeName} (${safeEmail}) emailed to ${adminEmail}`);
      return res.status(200).json({ message: "Application submitted successfully." });
    } catch (err) {
      console.error("Contact Mailer Error:", err.message);
      return res.status(200).json({ message: "Application received." });
    }
  }

  return res.status(200).json({ message: "Application received." });
});
app.get('/api/auth/digilocker', (req, res) => {
  const authUrl = `https://api.digitallocker.gov.in/authorize?client_id=${process.env.DL_ID}&response_type=code`;
  res.redirect(authUrl);
});

// Step 2: Handle callback
app.get('/api/auth/digilocker/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // 1. Exchange code for access_token
    const tokenResponse = await axios.post('https://api.digitallocker.gov.in/token', {
      client_id: process.env.DL_ID,
      client_secret: process.env.DL_SECRET, // You need this!
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.DL_REDIRECT_URI
    });

    // 2. Fetch User Profile
    const profile = await axios.get('https://api.digitallocker.gov.in/user', {
      headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` }
    });

    // 3. Extract KYC info and redirect to frontend with success
    // profile.data contains Aadhaar name, etc.
    res.redirect(`${process.env.CLIENT_URL}/enrollment?kycSuccess=true&name=${profile.data.name}`);

  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/enrollment?kycSuccess=false`);
  }
});
app.post('/api/admin/enroll-agent',
  [body('email').isEmail().normalizeEmail(),
  body('name').trim().escape()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, email, password, kyc, secretKey, otpVerified } = req.body;

    // 1. Verify Governance Key (No hardcoded fallbacks)
    const adminKey = (process.env.ADMIN_KEY || '').trim();
    const providedKey = (secretKey || req.headers['x-governance-key'] || '').trim();
    if (!adminKey || (providedKey !== adminKey && secretKey !== adminKey)) {
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
      // 2. Create the Agent
      const newAgent = new AuthorizedAgent({
        name,
        email: cleanEmail,
        password,
        kyc: kyc || {}
      });

      await newAgent.save();
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
    // Razorpay's Account Verification API
    const response = await razorpay.accounts.validate({
      account_number: accountNumber,
      ifsc: ifsc,
      name: "Beneficiary Name" // Ideally, pass the recipient's name here
    });

    // Return true if verification is successful
    return response.status === 'active';
  } catch (error) {
    console.error("Razorpay Verification Failed:", error);
    return false;
  }
}
// Add this to your server file
app.post('/api/verify-bank', apiLimiter, async (req, res) => {
  const { accountNumber, ifsc, orgName } = req.body;

  if (process.env.MOCK_BANK_VERIFICATION === 'true') {
    console.log("Mocking bank verification for account:", accountNumber);
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

app.get(secretTransferPath, (req, res) => {
  res.status(200).json({ message: "Aid transfer gate operational. Use POST to execute fund transfers." });
});

app.post(secretTransferPath,
  transferLimiter,
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
    const { email, password, transferData } = req.body;

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

      // Save to Database
      const newTransfer = new TransferAid({
        ...transferData,
        agentId: new mongoose.Types.ObjectId(),
        senderEmail: email || "networkamanah60@gmail.com"
      });

      if (session) {
        await newTransfer.save({ session });
        await createLedgerEntry('SPENT', transferData.orgName, transferData.amount, newTransfer._id, session);
        await session.commitTransaction();
      } else {
        await newTransfer.save();
        await createLedgerEntry('SPENT', transferData.orgName, transferData.amount, newTransfer._id, null);
      }

      // Send Email Notification
      try {
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: transferData.email,
            subject: "Donation Disbursement Confirmation",
            text: `Hello ${transferData.orgName}, your donation of ₹${transferData.amount} has been successfully processed and sent to your account.`
          });
        }
      } catch (mailErr) {
        console.error("Disbursement Mail Warning:", mailErr.message);
      }

      res.status(200).json({ message: "Payment Successful", transactionId: newTransfer._id });

    } catch (error) {
      if (session) await session.abortTransaction();
      console.error("Transfer Transaction Aborted:", error);
      res.status(500).json({ error: error.message });
    } finally {
      if (session) session.endSession();
    }
  });
app.post('/api/admin/verify-vault', (req, res) => {
  const { key } = req.body;
  const adminKey = (process.env.ADMIN_KEY || '').trim();
  const inputKey = (key || '').trim();
  if (inputKey && inputKey === adminKey) {
    // We can even set a short-lived "vault-access" cookie here
    return res.status(200).json({ unlocked: true });
  }
  res.status(403).json({ error: "Invalid Governance Key" });
});
// Add this route to server.js
app.get('/api/admin/check-access', adminAuth, (req, res) => {
  // adminAuth middleware already verified the JWT and user role.
  // If we reach this line, the user is authorized.
  res.status(200).json({ authorized: true });
});
// Ensure this is ABOVE your app.listen or export
app.get('/api/admin/ledger', adminAuth, async (req, res) => {
  try {
    await connectDB(); // Ensure DB connection before querying
    const { from, to, actionType } = req.query;
    const query = {};
    if (from && to && from !== 'undefined' && to !== 'undefined') {
      const startDate = new Date(from);
      const endDate = new Date(to);
      // Ensure we include the full duration of the 'to' day
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        endDate.setUTCHours(23, 59, 59, 999);
        query.timestamp = { $gte: startDate, $lte: endDate };
      }
    }
    if (actionType && actionType !== 'ALL' && actionType !== 'undefined') {
      query.actionType = { $regex: new RegExp(actionType, 'i') };
    } else {
      // If actionType is 'ALL' or empty, we explicitly ensure the query 
      // does NOT contain actionType, so it returns all records.
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
      query.actionType = { $regex: new RegExp(actionType, 'i') };
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
        <td style="padding: 8px; border: 1px solid #ddd;">${e.target}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${e.amount.toLocaleString()}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-size: 11px;">${e.transactionId}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #284D3D; margin-bottom: 5px;">Amanah Network Audit Ledger Report</h2>
        <p style="color: #666; font-size: 12px; margin-top: 0;">Generated on ${new Date().toLocaleString('en-IN')}</p>

        <div style="display: flex; gap: 15px; margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 4px;">
          <div style="margin-right: 20px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #666;">Total Received</div>
            <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">₹${totalReceived.toLocaleString()}</div>
          </div>
          <div style="margin-right: 20px;">
            <div style="font-size: 11px; text-transform: uppercase; color: #666;">Total Spent</div>
            <div style="font-size: 20px; font-weight: bold; color: #c62828;">₹${totalSpent.toLocaleString()}</div>
          </div>
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #666;">Current Reserve</div>
            <div style="font-size: 20px; font-weight: bold; color: #1565c0;">₹${(totalReceived - totalSpent).toLocaleString()}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background-color: #284D3D; color: white;">
              <th style="padding: 10px; border: 1px solid #ddd;">Date</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Action</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Target</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Amount</th>
              <th style="padding: 10px; border: 1px solid #ddd;">Txn ID</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5" style="padding: 15px; text-align: center; color: #888;">No ledger entries found.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Amanah Audit Ledger Report (${new Date().toLocaleDateString('en-IN')})`,
      html: htmlContent
    });

    res.status(200).json({ message: `Ledger report sent successfully to ${recipientEmail}` });
  } catch (error) {
    console.error("Send Ledger Email Error:", error);
    res.status(500).json({ error: error.message || "Failed to send ledger email." });
  }
});
// A central helper to keep your code DRY
async function createLedgerEntry(actionType, target, amount, transactionId, session) {
  // Add this validation check
  if (!target || !amount || !transactionId) {
    console.error("Ledger Save Failed: Missing fields", { target, amount, transactionId });
    return;
  }
  try {
    const newEntry = new Ledger({
      actionType, // 'RECEIVED' or 'SPENT'
      target,     // e.g., 'Donor Name' or 'Project Title'
      amount,
      transactionId,
      timestamp: new Date()
    });
    const saved = await newEntry.save({ session });
    console.log("Ledger entry saved successfully");
    return saved;
  } catch (err) {
    console.error("Ledger Save Error:", err);
    throw err; // This helps debug exactly what field is missing
  }
}
// --- DONATIONS 
app.get('/api/donations', adminAuth, async (req, res) => {
  res.status(200).json(await Donation.find().select('-__v'));
});


// --- ANALYTICS ---
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
app.get('/', (req, res) => {
  res.send('Amanah Network API is running. Use /api/ for endpoints.');
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('Amanah Backend Server running');
  });
}

export default app;