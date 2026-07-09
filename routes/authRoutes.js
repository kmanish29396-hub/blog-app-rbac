const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

function sendTokenCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/register');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      req.flash('error', 'An account with that email already exists.');
      return res.redirect('/auth/register');
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role });
    const token = signToken(user);
    sendTokenCookie(res, token);
    req.flash('success', `Welcome, ${user.name}! Your account (${role}) was created.`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong during registration.');
    res.redirect('/auth/register');
  }
});

router.get('/login', (req, res) => {
  res.render('login', { title: 'Log In' });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/auth/login');
    }

    const token = signToken(user);
    sendTokenCookie(res, token);
    req.flash('success', `Welcome back, ${user.name}!`);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong during login.');
    res.redirect('/auth/login');
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  req.flash('success', 'Logged out successfully.');
  res.redirect('/');
});

module.exports = router;