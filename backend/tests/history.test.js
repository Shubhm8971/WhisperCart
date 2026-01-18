const request = require('supertest');
const { app } = require('../server');
const History = require('../models/History');

beforeEach(async () => {
  await History.deleteMany({});
});

describe('History API', () => {
  it('GET /history should return an empty array if no history exists', async () => {
    const res = await request(app).get('/history');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual([]);
  });

  it('GET /history should return stored history items sorted by createdAt descending', async () => {
    const historyItem1 = {
      raw_text: 'I want a red shirt',
      product: 'shirt',
      budget: null,
      features: ['red'],
      createdAt: new Date('2023-01-01T10:00:00Z'),
    };
    const historyItem2 = {
      raw_text: 'Find me some blue shoes under 5000',
      product: 'shoes',
      budget: 5000,
      features: ['blue'],
      createdAt: new Date('2023-01-01T11:00:00Z'),
    };

    await History.insertMany([historyItem1, historyItem2]);

    const res = await request(app).get('/history');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(2);
    expect(res.body[0].raw_text).toEqual(historyItem2.raw_text); // Item 2 is newer
    expect(res.body[1].raw_text).toEqual(historyItem1.raw_text); // Item 1 is older
  });
});
