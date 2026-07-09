const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Har request pe cookie se JWT token check karo aur user ko attach karo
async function attachUser(req, res, next) {
  res.locals.user = null;
  const token = req.cookies.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      res.locals.user = user;
    }
  } catch (err) {
    res.clearCookie('token');
  }
  next();
}

// Login zaroori hai warna redirect kar do login page pe
function requireAuth(req, res, next) {
  if (!req.user) {
    req.flash('error', 'Please log in to continue.');
    return res.redirect('/auth/login');
  }
  next();
}

// Role-based access control — sirf allowed roles hi aage jaa sakte hain
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).render('403', { title: 'Access Denied' });
    }
    next();
  };
}

module.exports = { attachUser, requireAuth, authorize };