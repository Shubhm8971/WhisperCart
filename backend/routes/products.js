const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// GET all products
router.get('/', async (req, res) => {
  const { db } = req.app.locals;
  const products = await db.collection('products').find({}).toArray();
  res.json(products);
});

// POST a new product
router.post('/', async (req, res) => {
  const { db } = req.app.locals;
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Product name and price are required.' });
  }

  const newProduct = { name, price };
  const result = await db.collection('products').insertOne(newProduct);

  // MongoDB v3.x+ returns the inserted document in result.ops
  // For v4.x+, you might need to fetch it separately if needed, but ops is common
  res.status(201).json(result.ops ? result.ops[0] : { _id: result.insertedId, ...newProduct });
});

// PUT to update a product
router.put('/:id', async (req, res) => {
  const { db } = req.app.locals;
  const { id } = req.params;
  const { name, price } = req.body;
  
  try {
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { name, price } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(result);
  } catch (error) {
    // Catches errors like invalid ObjectId format
    res.status(400).json({ error: 'Invalid request or product ID.' });
  }
});

// DELETE a product
router.delete('/:id', async (req, res) => {
  const { db } = req.app.locals;
  const { id } = req.params;
  const result = await db.collection('products').deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  res.status(204).send();
});

module.exports = router;
