// REPLACE ALL 'require' WITH 'import'
import 'dotenv/config';
import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}
dns.setDefaultResultOrder('ipv4first');
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
// Keep your imports for internal files
import adminAuth from '../middleware/adminAuth.js'; // Note: Must include .js extension
import Ledger from '../models/Ledger.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import TransferAid from '../models/TransferAid.js';
import AuthorizedAgent from '../models/AuthorizedAgent.js';
const app = express();
const otpStore = {};
let isConnected = false;
// Add this helper function at the top of your file
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGO_URI);
};
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(helmet()); // Apply security headers
app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
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
// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 , socketTimeoutMS: 45000 })
  .then(() => console.log("🚀 Connected to MongoDB Atlas"))
  .catch(err => console.error("--- DATABASE CONNECTION FAILURE ---", err.message));

// --- MAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email Transporter Error:", error);
  } else {
    console.log("✅ Email Transporter is ready to send messages");
  }
});
// --- ADMIN ROUTES ---
// --- ADMIN ROUTES ---
// Tailored line 43: Using an anonymous function wrapper to prevent the "handler" error
app.post('/api/admin/create-member', (req, res, next) => {
  // This wrapper ensures we call your middleware correctly
  if (typeof adminAuth === 'function') return adminAuth(req, res, next);
  next(); // Fallback if middleware isn't loaded yet
}, async (req, res) => {
  try {
    const newAdmin = new User({ ...req.body, role: 'ADMIN', isVerified: false });
    await newAdmin.save();
    res.status(201).json({ message: "Admin member created successfully." });
  } catch (error) {
    res.status(400).json({ error: "Failed to create admin member." });
  }
});

// --- AUTH & REGISTRATION ---
// --- AUTHENTICATION ---
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check AuthorizedAgent collection (Agent / Board Member logins)
    const agent = await AuthorizedAgent.findOne({ email: cleanEmail });
    if (agent && agent.password) {
      const isMatch = await bcrypt.compare(password, agent.password);
      if (isMatch) {
        const token = jwt.sign({ id: agent._id, role: 'AGENT' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000
        });
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
        const token = jwt.sign({ id: user._id, role: user.role || 'USER' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000
        });
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
//registration
app.post('/api/register', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    const token = crypto.randomBytes(32).toString('hex');
    const newUser = new User({ ...req.body, verificationToken: token, isVerified: true});
    await newUser.save();
    try {
      await transporter.sendMail({
        from: '"Amanah Support" <amanahnetwork.official@gmail.com>',
        to: req.body.email,
        subject: 'THANKS FOR REGISTERING WITH AMANAH',
        text: `We are thrilled to welcome you to the Amanah Network! Your account has been created successfully. \nThank you for joining us in making a difference!`,
      });
    } catch (emailErr) {
      console.error("Email notification warning:", emailErr.message);
    }
    res.status(201).json({ message: "Registration successful! Account created." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/verify/:token', async (req, res) => {
  const user = await User.findOneAndUpdate({ verificationToken: req.params.token }, { isVerified: true, verificationToken: undefined });
  if (!user) return res.status(400).send("Invalid or expired token.");
  res.send("<h1>Account Verified!</h1>");
});

// --- PAYMENT INTEGRATION ---
app.post('/api/payment/create-order', async (req, res) => {
  const { amount, donorEmail, projectTitle , donorName , mobileNumber  } = req.body;
  if (!amount || !donorEmail || !donorName || !mobileNumber) {
    return res.status(400).json({ error: "Missing required donation details" });
  }

  try {
    await connectDB(); 
    let userExists = await User.findOne({ email: donorEmail.toLowerCase() });
    if (!userExists) {
      const nameParts = donorName.trim().split(' ');
      const firstName = nameParts[0] || donorName;
      const lastName = nameParts.slice(1).join(' ') || 'Donor';
      userExists = new User({
        firstName,
        lastName,
        email: donorEmail.toLowerCase(),
        mobileNumber,
        role: 'DONOR',
        isVerified: true
      });
      await userExists.save();
    }
    const order = await razorpay.orders.create({ 
        amount: amount * 100, 
        currency: "INR", 
        receipt: `receipt_${Date.now()}` 
    });
    res.status(200).json(order);
  } catch (error) {
    console.error("Payment Creation Error:", error);
    res.status(500).json({ error: error.message || "Failed to create order" });
  }
});
console.log("Payment route set up successfully.");
// email
 const resend = new Resend(process.env.RESEND_API_KEY);

const sendDonationEmail = async (donorEmail, amount) => {
  try {
    await resend.emails.send({
      from: 'Amanah Foundation <onboarding@resend.dev>', // Verified domain later
      to: 'networkamanah60@gmail.com',
      subject: 'Donation Received!',
      html: `<h1>Thank you!</h1><p>We received your donation of ₹${amount}.</p>`
    });
  } catch (err) {
    console.error("Resend Error:", err);
  }
};

// Ensure you have 'let isConnected = false;' defined at the top level of your server.js
app.post("/api/payment/verify", async (req, res) => {
  let session = null;
  try {
    if (!isConnected) {
      await mongoose.connect(process.env.MONGO_URI);
      isConnected = true;
    }
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }

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

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    
    if (hmac.digest("hex") !== razorpay_signature) {
      if (session) await session.abortTransaction();
      return res.status(400).json({ error: "Invalid signature" });
    }

    const existing = await Donation.findOne({ paymentId: razorpay_payment_id });
    if (existing) {
      if (session) await session.abortTransaction();
      return res.status(400).json({ error: "Payment already processed" });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status === 'captured') {
        const newDonation = new Donation({ 
          donorEmail, 
          donorName,
          mobileNumber, 
          amount, 
          projectTitle, 
          orderId: razorpay_order_id, 
          paymentId: razorpay_payment_id, 
          status: "SUCCESS" 
        });
       
        if (session) {
          await newDonation.save({session});
          await createLedgerEntry('RECEIVED', donorName, amount, razorpay_payment_id, session);
          await session.commitTransaction();
        } else {
          await newDonation.save();
          await createLedgerEntry('RECEIVED', donorName, amount, razorpay_payment_id, null);
        }
        sendDonationEmail(donorEmail, amount);
        
        return res.status(200).json({ status: "success", message: "Donation verified." });
    } else {
        if (session) await session.abortTransaction();
        return res.status(400).json({ error: "Payment not captured" });
    }
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Transaction Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  } finally {
    if (session) session.endSession();
  }
});
  app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });
  const cleanEmail = email.toLowerCase().trim();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[cleanEmail] = otp;
  otpStore[email] = otp;
  try {
    await transporter.sendMail({ from: process.env.EMAIL_USER, to: cleanEmail, subject: 'Your OTP', text: `Code: ${otp}` });
  } catch (err) {
    console.error("OTP Mail Error:", err);
  }
  res.json({ message: "OTP Sent" });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });
    const cleanEmail = email.toLowerCase().trim();
    if (otpStore[cleanEmail] === otp || otpStore[email] === otp) {
        otpStore[cleanEmail] = { verified: true };
        otpStore[email] = { verified: true };
        return res.json({ verified: true });
    }
    res.status(400).json({ error: "Invalid OTP" });
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
  const { name, email, password, kyc, secretKey } = req.body;

  // 1. Verify Governance Key
  const adminKey = (process.env.ADMIN_KEY || '').trim();
  if (!secretKey || secretKey.trim() !== adminKey) {
    return res.status(403).json({ error: "Unauthorized: Invalid Governance Key" });
  }
  const cleanEmail = (email || '').toLowerCase().trim();
  if (!otpStore[req.body.email]?.verified && !otpStore[cleanEmail]?.verified) {
    return res.status(401).json({ error: "Email not verified via OTP" });
  }
  try {
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
app.post('/api/verify-bank', async (req, res) => {
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
const transferLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: "Too many transfer attempts, please try again later."
});
app.use(process.env.SECRET_TRANSFER_PATH, transferLimiter);
app.post(process.env.SECRET_TRANSFER_PATH,
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
  const session = await mongoose.startSession();
  session.startTransaction();
  const { email, password, transferData } = req.body;

  try {
    // 1. Verify Agent
   /* const agent = await AuthorizedAgent.findOne({ email });
    if (!agent || !(await bcrypt.compare(password, agent.password))) {
      return res.status(401).json({ error: "Invalid Credentials" });
    }
*/
    // 2. Bank Verification (Razorpay)
    const verification = await razorpay.accounts.validate({
      account_number: transferData.accountNumber,
      ifsc: transferData.ifscCode,
      name: transferData.orgName
    });
    if (verification.status !== 'active') {
      return res.status(400).json({ error: "Bank account verification failed. Please check details." });
    }

    // 3. Save to Database
    const newTransfer = new TransferAid({
      ...transferData,
      agentId: 123456789,
      senderEmail: email || "networkamanah60@gmail.com"
    });
    
    await newTransfer.save({session});
    await createLedgerEntry('SPENT', transferData.orgName, transferData.amount, newTransfer._id, session);
    await session.commitTransaction();

    // 4. Send Email Notification
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: transferData.email,
      subject: "Donation Disbursement Confirmation",
      text: `Hello ${transferData.orgName}, your donation of ₹${transferData.amount} has been successfully processed and sent to your account.`
    });

    res.status(200).json({ message: "Payment Successful", transactionId: newTransfer._id });

  } catch (error){ // 5. Rollback on any failure
    console.error("Transfer Transaction Aborted:", error);
    res.status(500).json({ error: error.message });
  } finally {
    session.endSession();
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
  const { from, to,actionType } = req.query;
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
      query.actionType = { $regex:new RegExp(actionType, 'i') };
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
    const saved = await newEntry.save({session});
    console.log("Ledger entry saved successfully");
    return saved;
  } catch (err) {
    console.error("Ledger Save Error:", err);
    throw err; // This helps debug exactly what field is missing
  }
}
// --- DONATIONS 
app.get('/api/donations', async (req, res) => {
  res.status(200).json(await Donation.find());
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
    console.log(`🚀 Amanah Backend Server running on http://localhost:${PORT}`);
  });
}

export default app;