const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express(); 

app.use(express.json({ limit: '5mb' }));
app.use(cors());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/password_manager')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Models
const User = mongoose.model('User', {
  email: String,
  password: String,
  name: { type: String, default: '' },
  photo: { type: String, default: '' },
  role: { type: String, default: 'user' }
});

const Password = mongoose.model('Password', {
  userId: String,
  site: String,
  username: String,
  password: String,
  deleted: { type: Boolean, default: false }
});

const ActivityLog = mongoose.model('ActivityLog', {
  userId: String,
  adminEmail: String,
  action: String,
  target: String,
  detail: String,
  createdAt: { type: Date, default: Date.now }
});

const logActivity = (adminId, adminEmail, action, target, detail) => {
  ActivityLog.create({ userId: adminId, adminEmail, action, target, detail });
};

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('No token');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).send('Invalid token');
  }
};

// Admin Middleware
const admin = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user || user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// Signup
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'Email already registered' });
  
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, password: hashed });
  res.status(201).json({ email: user.email, name: user.name });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: 'Wrong password' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret123');
  res.json({ token, role: user.role });
});

// Change Password
app.put('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(400).json({ error: 'Wrong old password' });

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;
  await user.save();

  res.json({ message: 'Password updated' });
});

// Verify password (for inactivity lock)
app.post('/verify-password', auth, async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Wrong password' });
  res.json({ verified: true });
});

// Get passwords
app.get('/passwords', auth, async (req, res) => {
  const data = await Password.find({ userId: req.userId, deleted: false });
  res.json(data);
});

// Add password
app.post('/passwords', auth, async (req, res) => {
  const item = await Password.create({
    ...req.body,
    userId: req.userId
  });
  res.json(item);
});

// Update password
app.put('/passwords/:id', auth, async (req, res) => {
  const item = await Password.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Delete → Trash
app.delete('/passwords/:id', auth, async (req, res) => {
  await Password.findByIdAndUpdate(req.params.id, { deleted: true });
  res.send('Moved to trash');
});

// Trash
app.get('/trash', auth, async (req, res) => {
  const data = await Password.find({ userId: req.userId, deleted: true });
  res.json(data);
});

// Restore
app.put('/restore/:id', auth, async (req, res) => {
  await Password.findByIdAndUpdate(req.params.id, { deleted: false });
  res.send('Restored');
});

// Security Analysis
app.get('/security/analysis', auth, async (req, res) => {
  const passwords = await Password.find({ userId: req.userId, deleted: false });

  const analyzePassword = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent', 'Perfect'];
    return { score: Math.min(score, 6), label: labels[Math.min(score, 6)] };
  };

  const passwordTexts = passwords.map(p => p.password);
  const passwordCounts = {};
  passwordTexts.forEach(p => { passwordCounts[p] = (passwordCounts[p] || 0) + 1; });

  let weakCount = 0;
  let strongCount = 0;
  let reusedCount = 0;
  let totalStrength = 0;
  const details = [];

  passwords.forEach(p => {
    const analysis = analyzePassword(p.password);
    const isReused = passwordCounts[p.password] > 1;
    if (isReused) reusedCount++;
    if (analysis.score <= 2) weakCount++;
    if (analysis.score >= 5) strongCount++;
    totalStrength += analysis.score;
    details.push({ site: p.site, score: analysis.score, label: analysis.label, reused: isReused });
  });

  const avgStrength = passwords.length > 0 ? totalStrength / passwords.length : 0;
  const reusePenalty = passwords.length > 0 ? (reusedCount / passwords.length) * 25 : 0;
  const weakPenalty = passwords.length > 0 ? (weakCount / passwords.length) * 15 : 0;
  const rawScore = (avgStrength / 6) * 100 - reusePenalty - weakPenalty;
  const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  const getScoreLabel = (s) => {
    if (s >= 90) return 'Excellent';
    if (s >= 70) return 'Strong';
    if (s >= 50) return 'Good';
    if (s >= 30) return 'Fair';
    return 'Weak';
  };

  const recommendations = [];
  if (weakCount > 0) recommendations.push({ severity: 'critical', icon: '🔐', title: `${weakCount} weak password${weakCount > 1 ? 's' : ''} detected`, desc: `Update ${weakCount} weak password${weakCount > 1 ? 's' : ''} to improve your security score. Use at least 12 characters with mixed case, numbers, and symbols.` });
  if (reusedCount > 0) recommendations.push({ severity: 'high', icon: '🔄', title: `${reusedCount} reused password${reusedCount > 1 ? 's' : ''}`, desc: `You're using the same password in ${reusedCount} place${reusedCount > 1 ? 's' : ''}. If one site is breached, all those accounts are at risk.` });
  if (passwords.length === 0) recommendations.push({ severity: 'medium', icon: '📂', title: 'No passwords saved yet', desc: 'Start adding your passwords to the vault so we can analyze and improve your security.' });
  if (overallScore >= 70 && weakCount === 0 && reusedCount === 0) recommendations.push({ severity: 'medium', icon: '✅', title: 'Great shape!', desc: 'Your passwords look strong with no reuse detected. Keep up the good practices and rotate critical passwords every 3-6 months.' });
  if (recommendations.length === 0) recommendations.push({ severity: 'medium', icon: '🛡️', title: 'Enable 2FA', desc: 'Add two-factor authentication to your accounts for an extra layer of protection beyond strong passwords.' });

  if (passwords.length > 0) recommendations.push({ severity: 'info', icon: '📊', title: 'Password diversity', desc: `You have ${passwords.length} unique site${passwords.length !== 1 ? 's' : ''} with ${strongCount} strong password${strongCount !== 1 ? 's' : ''}. Aim for all passwords to be "Strong" or higher.` });

  res.json({
    score: overallScore,
    label: getScoreLabel(overallScore),
    total: passwords.length,
    weakCount,
    reusedCount,
    strongCount,
    details,
    recommendations,
  });
});

// Profile
app.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.put('/profile', auth, async (req, res) => {
  const { name, photo } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (photo !== undefined) update.photo = photo;
  const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Setup first admin (call once)
app.post('/setup-admin', async (req, res) => {
  const { email, secret } = req.body;
  if (secret !== (process.env.ADMIN_SECRET || 'admin-setup-secret')) return res.status(403).json({ error: 'Invalid secret' });
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Admin role assigned', user });
});

// ===== Admin Routes =====

// Admin stats
app.get('/admin/stats', auth, admin, async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalPasswords = await Password.countDocuments({ deleted: false });
  const trashedPasswords = await Password.countDocuments({ deleted: true });
  const adminCount = await User.countDocuments({ role: 'admin' });
  const allPasswords = await Password.find({ deleted: false });
  const passwordTexts = allPasswords.map(p => p.password);
  const counts = {};
  passwordTexts.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
  const reusedPasswords = passwordTexts.filter(p => counts[p] > 1).length;
  const weakPasswords = allPasswords.filter(p => p.password.length < 8).length;
  const totalStrength = allPasswords.reduce((sum, p) => {
    let s = 0;
    if (p.password.length >= 8) s++;
    if (p.password.length >= 12) s++;
    if (/[A-Z]/.test(p.password)) s++;
    if (/[0-9]/.test(p.password)) s++;
    if (/[^A-Za-z0-9]/.test(p.password)) s++;
    return sum + Math.min(s, 6);
  }, 0);
  const avgStrength = allPasswords.length > 0 ? (totalStrength / allPasswords.length / 6 * 100).toFixed(0) : 0;
  res.json({ totalUsers, totalPasswords, trashedPasswords, adminCount, reusedPasswords, weakPasswords, avgStrength: Number(avgStrength) });
});

// Activity logs
app.get('/admin/activity', auth, admin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    ActivityLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    ActivityLog.countDocuments()
  ]);
  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) });
});

// Security analytics (cross-user)
app.get('/admin/security-analytics', auth, admin, async (req, res) => {
  const allPasswords = await Password.find({ deleted: false });
  const total = allPasswords.length;
  let weakCount = 0, reusedCount = 0, strongCount = 0, noUpper = 0, noDigit = 0, noSpecial = 0, shortCount = 0;
  const passwordTexts = allPasswords.map(p => p.password);
  const freq = {};
  passwordTexts.forEach(p => { freq[p] = (freq[p] || 0) + 1; });
  allPasswords.forEach(p => {
    const pw = p.password;
    if (pw.length < 8) shortCount++;
    if (pw.length >= 8 && pw.length < 12) weakCount++;
    if (pw.length >= 12) strongCount++;
    if (!/[A-Z]/.test(pw)) noUpper++;
    if (!/[0-9]/.test(pw)) noDigit++;
    if (!/[^A-Za-z0-9]/.test(pw)) noSpecial++;
    if (freq[pw] > 1) reusedCount++;
  });
  res.json({ total, weakCount, reusedCount, strongCount, noUpper, noDigit, noSpecial, shortCount });
});

// System health
app.get('/admin/system-health', auth, admin, async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.ping();
    dbStatus = result.ok === 1 ? 'connected' : 'degraded';
  } catch { dbStatus = 'error'; }
  const mem = process.memoryUsage();
  res.json({
    node: process.version,
    platform: process.platform,
    uptime: Math.floor(process.uptime()),
    memory: { rss: Math.round(mem.rss / 1024 / 1024), heapTotal: Math.round(mem.heapTotal / 1024 / 1024), heapUsed: Math.round(mem.heapUsed / 1024 / 1024) },
    mongodb: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// List users with search, role filter, pagination
app.get('/admin/users', auth, admin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { email: { $regex: search, $options: 'i' } },
    { name: { $regex: search, $options: 'i' } }
  ];
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter)
  ]);
  const enriched = await Promise.all(users.map(async (u) => {
    const pwCount = await Password.countDocuments({ userId: u._id });
    return { ...u.toObject(), passwordCount: pwCount };
  }));
  res.json({ users: enriched, total, page, totalPages: Math.ceil(total / limit) });
});

// Get single user details
app.get('/admin/users/:id', auth, admin, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  const passwords = await Password.find({ userId: req.params.id });
  let weak = 0, strong = 0;
  passwords.forEach(p => {
    let s = 0;
    if (p.password.length >= 8) s++;
    if (p.password.length >= 12) s++;
    if (/[A-Z]/.test(p.password)) s++;
    if (/[0-9]/.test(p.password)) s++;
    if (/[^A-Za-z0-9]/.test(p.password)) s++;
    if (Math.min(s, 6) <= 2) weak++;
    else if (Math.min(s, 6) >= 4) strong++;
  });
  res.json({ ...user.toObject(), passwords, passwordStats: { total: passwords.length, weak, strong } });
});

app.delete('/admin/users/:id', auth, admin, async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  const adminUser = await User.findById(req.userId);
  const pwCount = await Password.countDocuments({ userId: req.params.id });
  await User.findByIdAndDelete(req.params.id);
  await Password.deleteMany({ userId: req.params.id });
  logActivity(req.userId, adminUser?.email, 'delete_user', target.email, `Deleted user and ${pwCount} passwords`);
  res.json({ message: 'User deleted' });
});

app.put('/admin/users/:id/role', auth, admin, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  const adminUser = await User.findById(req.userId);
  logActivity(req.userId, adminUser?.email, 'change_role', user.email, `Role changed to ${role}`);
  res.json(user);
});

app.get('/admin/all-passwords', auth, admin, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const filter = {};
  if (search) filter.$or = [
    { site: { $regex: search, $options: 'i' } },
    { username: { $regex: search, $options: 'i' } }
  ];
  const [data, total] = await Promise.all([
    Password.find(filter).sort({ _id: -1 }).skip(skip).limit(limit),
    Password.countDocuments(filter)
  ]);
  const enriched = await Promise.all(data.map(async (pw) => {
    const owner = await User.findById(pw.userId).select('email name');
    return { ...pw.toObject(), owner: owner ? { email: owner.email, name: owner.name } : null };
  }));
  res.json({ passwords: enriched, total, page, totalPages: Math.ceil(total / limit) });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});