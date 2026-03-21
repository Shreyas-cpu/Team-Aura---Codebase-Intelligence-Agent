export const mockNodes = [
  { id: "app.js",              type: "root",       size: 3.2 },
  { id: "auth.routes.js",      type: "route",      size: 1.8 },
  { id: "post.routes.js",      type: "route",      size: 1.6 },
  { id: "auth.controller.js",  type: "controller", size: 2.4 },
  { id: "post.controller.js",  type: "controller", size: 2.1 },
  { id: "user.service.js",     type: "service",    size: 2.8 },
  { id: "post.service.js",     type: "service",    size: 2.2 },
  { id: "user.model.js",       type: "model",      size: 1.9 },
  { id: "post.model.js",       type: "model",      size: 1.7 },
  { id: "db.config.js",        type: "config",     size: 1.2 },
]

export const mockLinks = [
  { source: "app.js",              target: "auth.routes.js" },
  { source: "app.js",              target: "post.routes.js" },
  { source: "auth.routes.js",      target: "auth.controller.js" },
  { source: "post.routes.js",      target: "post.controller.js" },
  { source: "auth.controller.js",  target: "user.service.js" },
  { source: "post.controller.js",  target: "post.service.js" },
  { source: "user.service.js",     target: "user.model.js" },
  { source: "post.service.js",     target: "post.model.js" },
  { source: "user.model.js",       target: "db.config.js" },
  { source: "post.model.js",       target: "db.config.js" },
]

export const FILE_META = {
  "app.js": {
    desc: "Express app entry point. Registers all routes and middleware.",
    lines: 42,
    size: "3.2 KB",
    complexity: 5,
    maintainability: 78,
    codeSnippet: `const express = require('express');
const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

module.exports = app;`
  },
  "auth.routes.js": {
    desc: "HTTP route handlers for /auth — login, register, logout.",
    lines: 28,
    size: "1.8 KB",
    complexity: 3,
    maintainability: 85,
    codeSnippet: `const router = require('express').Router();
const authController = require('./auth.controller');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);

module.exports = router;`
  },
  "post.routes.js": {
    desc: "HTTP route handlers for /posts REST endpoints.",
    lines: 24,
    size: "1.6 KB",
    complexity: 2,
    maintainability: 90,
    codeSnippet: `const router = require('express').Router();
const postController = require('./post.controller');

router.get('/', postController.getAll);
router.post('/', postController.create);
router.put('/:id', postController.update);
router.delete('/:id', postController.delete);

module.exports = router;`
  },
  "auth.controller.js": {
    desc: "Authentication logic: token generation, password hashing.",
    lines: 87,
    size: "4.1 KB",
    complexity: 12,
    maintainability: 65,
    codeSnippet: `const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./user.model');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
};`
  },
  "post.controller.js": {
    desc: "Controls post CRUD: create, read, update, delete.",
    lines: 74,
    size: "3.8 KB",
    complexity: 8,
    maintainability: 72,
    codeSnippet: `const Post = require('./post.model');

exports.getAll = async (req, res) => {
  const posts = await Post.find().populate('author');
  res.json(posts);
};

exports.create = async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.status(201).json(post);
};`
  },
  "user.service.js": {
    desc: "Business logic for user management and queries.",
    lines: 112,
    size: "5.2 KB",
    complexity: 15,
    maintainability: 58,
    codeSnippet: `const User = require('./user.model');
const bcrypt = require('bcrypt');

class UserService {
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = new User({ ...userData, password: hashedPassword });
    return await user.save();
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }
}

module.exports = new UserService();`
  },
  "post.service.js": {
    desc: "Post business logic and data transformations.",
    lines: 96,
    size: "4.5 KB",
    complexity: 10,
    maintainability: 68,
    codeSnippet: `const Post = require('./post.model');

class PostService {
  async getPostsWithAuthors() {
    return await Post.find().populate('author', 'name email');
  }

  async createPost(postData, authorId) {
    const post = new Post({ ...postData, author: authorId });
    return await post.save();
  }
}

module.exports = new PostService();`
  },
  "user.model.js": {
    desc: "Mongoose schema and model for User documents.",
    lines: 35,
    size: "1.9 KB",
    complexity: 4,
    maintainability: 82,
    codeSnippet: `const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);`
  },
  "post.model.js": {
    desc: "Mongoose schema for Post documents.",
    lines: 31,
    size: "1.7 KB",
    complexity: 3,
    maintainability: 88,
    codeSnippet: `const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);`
  },
  "db.config.js": {
    desc: "MongoDB connection and database configuration.",
    lines: 18,
    size: "1.2 KB",
    complexity: 2,
    maintainability: 95,
    codeSnippet: `const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});`
  },
}
