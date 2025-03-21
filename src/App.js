import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import xaiClient from './xai';
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
  const [devPrompt, setDevPrompt] = useState('');
  const [devResponse, setDevResponse] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [quickBooksToken, setQuickBooksToken] = useState(null);
  const [quickBooksSales, setQuickBooksSales] = useState([]);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetch('/api/hello')
          .then((response) => response.json())
          .then((data) => setData(data))
          .catch((error) => setData({
            message: 'Error fetching data',
            sales: 0,
            inventory: 0,
            adSpend: 0
          }));
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      fetch(`/api/quickbooks-callback?code=${code}`)
        .then((response) => response.json())
        .then((result) => {
          setQuickBooksToken(result.access_token);
          window.history.replaceState({}, document.title, "/");
        })
        .catch((error) => setError('Failed to authenticate with QuickBooks'));
    }
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError('Failed to register: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setData({ message: 'Loading...', sales: 0, inventory: 0, adSpend: 0 });
      setXaiResponse('');
      setXaiPrompt('');
      setDevResponse('');
      setDevPrompt('');
      setQuickBooksToken(null);
      setQuickBooksSales([]);
    } catch (err) {
      setError('Failed to log out: ' + err.message);
    }
  };

  const handleAskXai = async () => {
    if (!user) {
      setXaiResponse('Please log in to use xAI features.');
      return;
    }
    try {
      const response = await xaiClient.generateText({
        model: 'grok-2-latest',
        prompt: `You are a business analytics assistant for a small business management platform. The business has the following data: ${
          quickBooksSales.length > 0
            ? `Recent sales transactions: ${JSON.stringify(quickBooksSales.map(sale => ({ date: sale.TxnDate, amount: sale.TotalAmt })))}`
            : `Mock data: ${JSON.stringify({ sales: data.sales, inventory: data.inventory, adSpend: data.adSpend })}`
        }. Provide actionable suggestions based on this data. ${xaiPrompt}`,
        temperature: 0
      });
      setXaiResponse(response.text);
    } catch (error) {
      setXaiResponse('Error getting response from xAI');
    }
  };

  const handleAskXaiForDevHelp = async () => {
    if (!user) {
      setDevResponse('Please log in to use xAI features.');
      return;
    }
    try {
      const response = await xaiClient.generateText({
        model: 'grok-2-latest',
        prompt: `You are a coding assistant for a React-based small business management platform. ${devPrompt}`,
        temperature: 0
      });
      setDevResponse(response.text);
    } catch (error) {
      setDevResponse('Error getting response from xAI');
    }
  };

  const handleQuickBooksAuth = () => {
    window.location.href = '/api/quickbooks-auth';
  };

  const handleFetchQuickBooksSales = async () => {
    if (!quickBooksToken || !companyId) {
      setError('Please authenticate with QuickBooks and provide a company ID.');
      return;
    }
    try {
      const response = await fetch('/api/quickbooks-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: quickBooksToken, company_id: companyId })
      });
      const salesData = await response.json();
      setQuickBooksSales(salesData.QueryResponse?.SalesReceipt || []);
    } catch (error) {
      setError('Failed to fetch QuickBooks sales data');
    }
  };

  if (!user) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Business Management Platform</h1>
        </header>
        <main>
          <section>
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                style={{ width: '200px', padding: '5px', margin: '5px' }}
              />
              <br />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ width: '200px', padding: '5px', margin: '5px' }}
              />
              <br />
              <button onClick={isRegistering ? handleRegister : handleLogin}>
                {isRegistering ? 'Register' : 'Log In'}
              </button>
              <br />
              <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: '10px' }}>
                {isRegistering ? 'Switch to Login' : 'Switch to Register'}
              </button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Business Management Platform</h1>
      </header>
      <main>
        <section>
          <h2>Dashboard</h2>
          <div>
            <h3>Welcome, {user.email}</h3>
            <button onClick={handleLogout}>Log Out</button>
          </div>
          <div>
            <h3>QuickBooks Integration</h3>
            {!quickBooksToken ? (
              <button onClick={handleQuickBooksAuth}>Connect to QuickBooks</button>
            ) : (
              <div>
                <input
                  type="text"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  placeholder="Enter QuickBooks Company ID"
                  style={{ width: '200px', padding: '5px', margin: '5px' }}
                />
                <button onClick={handleFetchQuickBooksSales}>Fetch Sales Data</button>
                {quickBooksSales.length > 0 && (
                  <div>
                    <h4>Recent Sales</h4>
                    <ul>
                      {quickBooksSales.map((sale, index) => (
                        <li key={index}>
                          Date: {sale.TxnDate}, Amount: ${sale.TotalAmt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <h3>Your Metrics (Mock Data)</h3>
            <p>Sales: ${data.sales}</p>
            <p>Inventory: {data.inventory} units</p>
            <p>Ad Spend: ${data.adSpend}</p>
            <p>Message: {data.message}</p>
          </div>
          <div>
            <h3>Ask xAI for Business Insights</h3>
            <input
              type="text"
              value={xaiPrompt}
              onChange={(e) => setXaiPrompt(e.target.value)}
              placeholder="e.g., How can I improve my sales?"
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
          <div>
            <h3>Ask xAI for Development Help</h3>
            <input
              type="text"
              value={devPrompt}
              onChange={(e) => setDevPrompt(e.target.value)}
              placeholder="e.g., How can I add a chart to my dashboard?"
              style={{ width: '300px', padding: '5px' }}
            />
            <button onClick={handleAskXaiForDevHelp}>Ask xAI</button>
            {devResponse && (
              <div>
                <h4>xAI Development Response:</h4>
                <p>{devResponse}</p>
              </div>
            )}
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </section>
      </main>
    </div>
  );
}

export default App;