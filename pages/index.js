export default function Home() {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>🛒 WhisperCart API</h1>
      <p>AI-Powered Shopping Assistant with Deal Negotiation</p>
      
      <h2>Available Endpoints:</h2>
      <ul style={{ textAlign: 'left', display: 'inline-block' }}>
        <li><code>/api/health</code> - Health check</li>
        <li><code>/api/search?q=laptop&budget=50000</code> - Search products</li>
        <li><code>POST /api/negotiate</code> - AI deal negotiation</li>
      </ul>

      <h2>Status: ✅ Live on Vercel</h2>
      <p>Mobile app connection: Ready</p>
      <p>Backend API: Running</p>
    </div>
  );
}
