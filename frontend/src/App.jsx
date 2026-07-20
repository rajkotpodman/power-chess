import React, { useState, useEffect } from 'react';
// BrowserRouter ની જગ્યાએ HashRouter ઉપયોગ કર્યો છે (દરેક હોસ્ટિંગમાં 404 ની કાયમી મુક્તિ)
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import Home from './components/Home';
import Game from './components/Game';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', backgroundColor: '#161512', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>
        <h2>Loading Chess...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={user ? <Home user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/game/:roomId" 
          element={user ? <Game user={user} isAiMode={false} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/game/solo" 
          element={user ? <Game user={user} isAiMode={true} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
