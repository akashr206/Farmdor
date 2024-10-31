// routes/productRoutes.js
const express = require('express');
const Product = require('../models/Product');
const router = express.Router();
const { isAuthenticated, isFarmer } = require('../middleware/authMiddleware');

// Route to display the farmer dashboard with their products
router.get('/', isAuthenticated, isFarmer, async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id });
    res.render('manageproducts', { farmerName: req.user.name, products, title: "FARMDOR · Dashboard", page: "products", showFooter: false, roleheader: 'farmer' });
  } catch (error) {
    res.status(500).json({ message: 'Error loading dashboard', error: error.message });
  }
});

// Route to add a new product
router.post('/add', isAuthenticated, isFarmer, async (req, res) => {
  const { name, price, quantity } = req.body;
  let city = req.user.city
  try {
    const newProduct = new Product({
      name,
      price,
      quantity,
      farmer: req.user._id,
      location: req.user.location,
      city,
    });
    await newProduct.save();
    res.redirect('/manageproducts'); // Redirect back to the dashboard after adding the product
  } catch (error) {
    res.status(500).json({ message: 'Error adding product', error: error.message });
  }
});

// Route to edit a product
router.get('/edit/:id', isAuthenticated, isFarmer, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }
    res.render('editProduct', { product, page: 'home', title: 'FARMDOR · Edit', showFooter: false });
  } catch (error) {
    res.status(500).json({ message: 'Error loading product for editing', error: error.message });
  }
});

// Route to update a product
router.post('/edit/:id', isAuthenticated, isFarmer, async (req, res) => {
  const { name, price, quantity } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }
    product.name = name;
    product.price = price;
    product.quantity = quantity;
    await product.save();
    res.redirect('/manageproducts');
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Route to delete a product
router.post('/delete/:id', isAuthenticated, isFarmer, async (req, res) => {

  const product = await Product.findById(req.params.id);
  try {

    if (product.farmer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }
    await Product.findByIdAndDelete(req.params.id)
    res.redirect('/manageproducts');
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

module.exports = router;
