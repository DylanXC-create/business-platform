import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
  const [preferredMetrics, setPreferredMetrics] = useState({
    showSales: true,
    showInventory: true,
    showAdSpend: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setPreferredMetrics(userData.preferredMetrics || {
            showSales: true,
            showInventory: true,
            showAdSpend: true
          });
        }
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
      setPreferredMetrics({ showSales: true, showInventory: true, showAdSpend: true });
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
      const response = await fetch('/api/ask-xai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: xaiPrompt,
          businessData: {
            sales: data.sales,
            inventory: data.inventory,
            adSpend: data.adSpend
          }
        })
      });
      const result = await response.json();
      setXaiResponse(result.response);
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
      const response = await fetch('/api/ask-xai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a coding assistant for a React-based small business management platform. ${devPrompt}`
        })
      });
      const result = await response.json();
      setDevResponse(result.response);
    } catch (error) {
      setDevResponse('Error getting response from xAI');
    }
  };

  const handlePredictSales = async () => {
    if (!user) {
      setXaiResponse('Please log in to use xAI features.');
      return;
    }
    try {
      const mockSalesData = [
        { date: '2025-01-01', amount: 5000 },
        { date: '2025-02-01', amount: 5500 },
        { date: '2025-03-01', amount: 6000 }
      ];
      const response = await fetch('/api/ask-xai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a predictive analytics assistant. Based on the following sales data: ${JSON.stringify(mockSalesData)}. Forecast the sales trend for the next 3 months and provide recommendations.`
        })
      });
      const result = await response.json();
      setXaiResponse(result.response);
    } catch (error) {
      setXaiResponse('Error getting predictive analytics from xAI');
    }
  };

  const handleSavePreferences = async () => {
    if (!user) {
      setError('Please log in to save preferences.');
      return;
    }
    try {
      await setDoc(doc(db, 'users', user.uid), {
        preferredMetrics: preferredMetrics
      }, { merge: true });
      setError('');
      alert('Preferences saved successfully!');
    } catch (err) {
      setError('Failed to save preferences: ' + err.message);
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
            <h3>Your Metrics (Mock Data)</h3>
            {preferredMetrics.showSales && <p>Sales: ${data.sales}</p>}
            {preferredMetrics.showInventory && <p>Inventory: {data.inventory} units</p>}
            {preferredMetrics.showAdSpend && <p>Ad Spend: ${data.adSpend}</p>}
            <p>Message: {data.message}</p>
          </div>
          <div>
            <h3>Customize Metrics Display</h3>
            <label>
              <input
                type="checkbox"
                checked={preferredMetrics.showSales}
                onChange={(e) => setPreferredMetrics({ ...preferredMetrics, showSales: e.target.checked })}
              />
              Show Sales
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={preferredMetrics.showInventory}
                onChange={(e) => setPreferredMetrics({ ...preferredMetrics, showInventory: e.target.checked })}
              />
              Show Inventory
            </label>
            <br />
            <label>
              <input
                type="checkbox"
                checked={preferredMetrics.showAdSpend}
                onChange={(e) => setPreferredMetrics({ ...preferredMetrics, showAdSpend: e.target.checked })}
              />
              Show Ad Spend
            </label>
            <br />
            <button onClick={handleSavePreferences}>Save Preferences</button>
          </div>
          <div>
            <h3>Predictive Analytics (Mock Data)</h3>
            <button onClick={handlePredictSales}>Predict Sales Trend</button>
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