const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const ejsLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const company = require('./routes/company')
const farmer = require('./routes/farmer')
const products = require('./routes/viewProducts')
const Product = require('./models/Product');
const User = require('./models/User');
const Connect = require('./models/connect')
const { ObjectId } = require('mongodb');
const { isAuthenticated } = require('./middleware/authMiddleware');
// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Create Express app
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Set static folder for CSS, images, etc.
app.use(express.static(path.join(__dirname, 'public')));
app.use(ejsLayouts); // Add this line
app.set('layout', 'layouts/layout'); // Set the default layout

// Routes
app.use('/products', products)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/manageproducts', productRoutes);
app.use('/company', company)
app.use('/farmer', farmer)

// Homepage route
app.get('/', (req, res) => {
  let token = req.cookies.token
  const roleredirect = req.cookies.role;
  if (token && roleredirect === 'farmer') {
    res.redirect('/farmer');
  } else if (token && roleredirect === 'company') {
    res.redirect('/company');
  } else {
    res.render('index', { title: 'Welcome to FARMDOR', login: true, page: 'home', title: 'FARMDOR', showFooter: true, role: roleredirect });
  }
});

// Render EJS files for login and register
app.get('/register', (req, res) => {
  let token = req.cookies.token;
  const roleredirect = req.cookies.role;
  const role = req.query.role || 'farmer'
  if (token && roleredirect === 'farmer') {
    res.redirect('/farmer');
  } else if (token && roleredirect === 'company') {
    res.redirect('/company');
  } else {
    res.render('register', { title: 'FARMDOR · Register', role, page: 'register' }); // This will render views/register.ejs
  }
});

app.get('/login', async (req, res) => {
  await Connect.deleteMany({})
  let token = req.cookies.token;
  const roleredirect = req.cookies.role;
  if (token && roleredirect === 'farmer') {
    res.redirect('/farmer');
  } else if (token && roleredirect === 'company') {
    res.redirect('/company');
  } else {
    res.render('login', { title: 'FARMDOR · Login', page: 'login' }); // This will render views/login.ejs
  }
});

app.get('/account', isAuthenticated, async (req, res) => {
  let user = req.user
  res.render('account', { title: "FARMDOR · Account", user, roleheader: user.role, page: 'account' });
})

app.post('/connect', isAuthenticated, async (req, res) => {
  let from = req.user._id.toString();
  let fromName = req.user.name;
  let to = req.body.to;
  let productId = new ObjectId(to)
  let product = await Product.findOne({ _id: productId })
  to = product.farmer.toString()
  let farmer = await User.findOne({ _id: product.farmer })
  let toName = farmer.name;
  let existing = await Connect.find({ from })
  let flag= 0  
  for (const exist of existing) {
    if (exist.to == to) {
      flag += 1;
      return res.json({ message: "Connection request is already sent." });
    }
  }
  if (flag === 0) {
    try {
      const connect = await Connect.create({
        from,
        fromName,
        to,
        toName,
        status: "pending"
      });
      await connect.save();
      return res.json({ message: "Connection request sent!" });
    } catch (error) {
      return res.status(500).json({ message: "Error saving connection request." });
    }
  }
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

