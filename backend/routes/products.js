const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import the Mongoose Product model

// GET all products
router.get('/', async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// POST a new product
router.post('/', async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }

  try {
    const product = await Product.create({ name, price });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT to update a product
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { name, price },
      { new: true, runValidators: true } // Return new document and run schema validators
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    // Catches errors like invalid ObjectId format or validation errors
    res.status(400).json({ error: 'Invalid request or product ID.' });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Invalid product ID.' });
  }
});

module.exports = router;
