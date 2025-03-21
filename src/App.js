import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState({
    message: 'Loading...',
    sales: 0,
    inventory: 0,
    adSpend: 0
  });
  const [xaiPrompt, setXaiPrompt] = useState('');
  const [xaiResponse, setXaiResponse] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => setData({
        message: 'Error fetching data',
        sales: 0,
        inventory: 0,
        adSpend: 0
      }));
  }, []);

  const handleAskXai = async () => {
    try {
      const response = await fetch('/api/ask-xai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: xaiPrompt })
      });
      const result = await response.json();
      setXaiResponse(result.response);
    } catch (error) {
      setXaiResponse('Error getting response from xAI');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Business Management Platform</h1>
      </header>
      <main>
        <section>
          <h2>Dashboard</h2>
          <div>
            <h3>Your Metrics</h3>
            <p>Sales: ${data.sales}</p>
            <p>Inventory: {data.inventory} units</p>
            <p>Ad Spend: ${data.adSpend}</p>
            <p>Message: {data.message}</p>
          </div>
          <div>
            <h3>Ask xAI for Coding Help</h3>
            <input
              type="text"
              value={xaiPrompt}
              onChange={(e) => setXaiPrompt(e.target.value)}
              placeholder="e.g., How can I improve my dashboard?"
              style={{ width: '300px', padding: '5px' }}
            />
            <button onClick={handleAskXai}>Ask xAI</button>
            {xaiResponse && (
              <div>
                <h4>xAI Response:</h4>
                <p>{xaiResponse}</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;