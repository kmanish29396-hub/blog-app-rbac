const express = require('express');
const Post = require('../models/Post');
const { requireAuth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  const posts = await Post.find({ published: true })
    .populate('author', 'name')
    .sort({ createdAt: -1 });
  res.render('index', { title: 'Blog', posts });
});

router.get('/post/:slug', async (req, res) => {
  const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name');
  if (!post) return res.status(404).render('404', { title: 'Not Found' });
  res.render('post', { title: post.title, post });
});

router.get('/dashboard', requireAuth, authorize('admin'), async (req, res) => {
  const posts = await Post.find().populate('author', 'name').sort({ createdAt: -1 });
  res.render('dashboard', { title: 'Admin Dashboard', posts });
});

router.get('/dashboard/new', requireAuth, authorize('admin'), (req, res) => {
  res.render('editPost', { title: 'New Post', post: null });
});

router.post('/dashboard/new', requireAuth, authorize('admin'), async (req, res) => {
  const { title, content, published } = req.body;
  if (!title || !content) {
    req.flash('error', 'Title and content are required.');
    return res.redirect('/dashboard/new');
  }
  await Post.create({
    title,
    content,
    author: req.user._id,
    published: published === 'on',
  });
  req.flash('success', 'Post created.');
  res.redirect('/dashboard');
});

router.get('/dashboard/edit/:id', requireAuth, authorize('admin'), async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).render('404', { title: 'Not Found' });
  res.render('editPost', { title: 'Edit Post', post });
});

router.post('/dashboard/edit/:id', requireAuth, authorize('admin'), async (req, res) => {
  const { title, content, published } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).render('404', { title: 'Not Found' });

  post.title = title;
  post.content = content;
  post.published = published === 'on';
  await post.save();
  req.flash('success', 'Post updated.');
  res.redirect('/dashboard');
});

router.post('/dashboard/delete/:id', requireAuth, authorize('admin'), async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  req.flash('success', 'Post deleted.');
  res.redirect('/dashboard');
});

module.exports = router;