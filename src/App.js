import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState({
    message: 'Loading...',
    userData: { sales: 0, inventory: 0, adSpend: 0 },
    industryBenchmarks: { avgSales: 0, avgInventoryTurnover: 0, avgAdSpend: 0 },
    suggestion: ''
  });
  const [taskResult, setTaskResult] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => setData({
        message: 'Error fetching data',
        userData: { sales: 0, inventory: 0, adSpend: 0 },
        industryBenchmarks: { avgSales: 0, avgInventoryTurnover: 0, avgAdSpend: 0 },
        suggestion: ''
      }));
  }, []);

  const handleExecuteTask = async () => {
    try {
      const response = await fetch('/api/execute-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'place-order', amount: 50 })
      });
      const result = await response.json();
      setTaskResult(result.message);
    } catch (error) {
      setTaskResult('Error executing task');
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
            <p>Sales: ${data.userData.sales}</p>
            <p>Inventory: {data.userData.inventory} units</p>
            <p>Ad Spend: ${data.userData.adSpend}</p>
          </div>
          <div>
            <h3>Industry Benchmarks</h3>
            <p>Average Sales: ${data.industryBenchmarks.avgSales}</p>
            <p>Average Inventory Turnover: {data.industryBenchmarks.avgInventoryTurnover}x/year</p>
            <p>Average Ad Spend: ${data.industryBenchmarks.avgAdSpend}</p>
          </div>
          <div>
            <h3>XAI Suggestions</h3>
            <p>{data.suggestion}</p>
          </div>
          <button onClick={handleExecuteTask}>Approve Suggested Actions</button>
          {taskResult && (
            <div>
              <h3>Task Result</h3>
              <p>{taskResult}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;