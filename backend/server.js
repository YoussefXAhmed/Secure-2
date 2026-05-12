const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

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

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('No token');

  try {
    const decoded = jwt.verify(token, 'secret123');
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

  const token = jwt.sign({ id: user._id, role: user.role }, 'secret123');
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
  if (secret !== 'admin-setup-secret') return res.status(403).json({ error: 'Invalid secret' });
  const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Admin role assigned', user });
});

// ===== Admin Routes =====
app.get('/admin/users', auth, admin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

app.delete('/admin/users/:id', auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Password.deleteMany({ userId: req.params.id });
  res.json({ message: 'User deleted' });
});

app.put('/admin/users/:id/role', auth, admin, async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
  res.json(user);
});

app.get('/admin/all-passwords', auth, admin, async (req, res) => {
  const data = await Password.find();
  res.json(data);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});