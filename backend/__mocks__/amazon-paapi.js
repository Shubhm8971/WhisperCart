const mockSearchItems = jest.fn();

const mockProductAdvertisingAPIClient = jest.fn(() => ({
  searchItems: mockSearchItems,
}));

module.exports = {
  ProductAdvertisingAPIClient: mockProductAdvertisingAPIClient,
  mockSearchItems, // Export for direct access in tests
};
