const { validationResult } = require('express-validator');
const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, tags } = req.body;
    
    const post = await Post.create({
      content,
      author: req.user._id,
      tags: tags || [],
      image: req.file ? req.file.path : null
    });

    const populatedPost = await post.populate('author', 'username profilePicture');

    res.status(201).json(populatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (with pagination)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture');

    const total = await Post.countDocuments();

    res.json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username profilePicture')
      .populate('comments.author', 'username profilePicture')
      .populate('likes', 'username profilePicture');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the post author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    post.content = req.body.content || post.content;
    post.tags = req.body.tags || post.tags;
    
    if (req.file) {
      post.image = req.file.path;
    }

    const updatedPost = await post.save();
    await updatedPost.populate('author', 'username profilePicture');

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the post author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);

    if (likeIndex === -1) {
      // Like the post
      post.likes.push(req.user._id);
    } else {
      // Unlike the post
      post.likes.splice(likeIndex, 1);
    }

    const updatedPost = await post.save();
    await updatedPost.populate('author', 'username profilePicture');
    await updatedPost.populate('likes', 'username profilePicture');

    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      author: req.user._id
    };

    post.comments.unshift(comment);
    const updatedPost = await post.save();
    await updatedPost.populate('comments.author', 'username profilePicture');

    res.status(201).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment
};
