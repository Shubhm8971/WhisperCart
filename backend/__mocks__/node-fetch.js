const fetch = jest.fn();

fetch.mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({
    request_info: { success: true },
    search_results: [
      { title: 'Mock Product 1', price: { value: 100 } },
      { title: 'Mock Product 2', price: { value: 200 } },
    ],
  }),
});

module.exports = fetch;