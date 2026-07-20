import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 👈 રીડાયરેક્ટ કરવા માટે આ ઇમ્પોર્ટ કર્યું

export default function Login() { // 👈 ઓલ્ડ પ્રોપ કાઢી નાખ્યો
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // 👈 નેવિગેશન હૂક ઇનિશિયલાઇઝ કર્યો

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/'); // 👈 લોગિન/સાઇન-અપ સક્સેસ થાય એટલે સીધા હોમ પેજ પર મોકલી દેશે
    } catch (err) {
      setError(err.message);
    }
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/'); // 👈 ગૂગલ લોગિન પછી પણ સીધા હોમ પેજ પર મોકલશે
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#161512' }}>
      <div style={{ backgroundColor: '#262421', padding: '40px', borderRadius: '8px', width: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '20px' }}>{isLogin ? 'Login to Chess' : 'Sign Up for Chess'}</h2>
        
        {error && <p style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleAuth}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
          />
          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', backgroundColor: '#b58863', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isLogin ? <><LogIn size={18} style={{verticalAlign:'middle', marginRight:'8px'}}/> Login</> : <><UserPlus size={18} style={{verticalAlign:'middle', marginRight:'8px'}}/> Sign Up</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={googleSignIn} style={{ width: '100%', padding: '10px', backgroundColor: '#fff', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" style={{marginRight: '10px'}} />
            Continue with Google
          </button>
        </div>

        <p style={{ color: '#999', textAlign: 'center', marginTop: '20px', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
        </p>
      </div>
    </div>
  );
}