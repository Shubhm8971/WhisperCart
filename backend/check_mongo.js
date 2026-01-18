
require('dotenv').config();
const config = require('./config');
console.log('Mongo URI:', config.mongoURI);
const { MongoClient } = require('mongodb');

try {
    if (!config.mongoURI) {
        throw new Error('Mongo URI is undefined!');
    }
    const client = new MongoClient(config.mongoURI);
    console.log('Client created successfully');
} catch (e) {
    console.error('Error:', e.message);
}
