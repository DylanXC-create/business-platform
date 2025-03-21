import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => setMessage('Error fetching data'));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Business Management Platform</h1>
      </header>
      <main>
        <section>
          <h2>Dashboard</h2>
          <div>
            <p>Sales: $5,000</p>
            <p>Inventory: 500 units</p>
            <p>API Response: {message}</p>
            <button>Approve Order</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;