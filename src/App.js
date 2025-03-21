import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState({ message: 'Loading...', sales: 0, inventory: 0, suggestion: '' });

  useEffect(() => {
    fetch('/api/hello')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => setData({ message: 'Error fetching data', sales: 0, inventory: 0, suggestion: '' }));
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
            <p>Sales: ${data.sales}</p>
            <p>Inventory: {data.inventory} units</p>
            <p>Suggestion: {data.suggestion}</p>
            <p>API Response: {data.message}</p>
            <button>Approve Order</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;