class MockAssemblyAI {
  constructor({ apiKey }) {
    this.apiKey = apiKey;
    this.transcripts = {
      create: jest.fn(),
    };
  }
}

module.exports = { AssemblyAI: MockAssemblyAI };