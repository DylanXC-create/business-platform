import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
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
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetch('/api/fetch-data')
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
            <h3>Your Metrics</h3>
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
        </section>
      </main>
    </div>
  );
}

export default App;