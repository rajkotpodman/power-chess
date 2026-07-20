import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Cpu, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

export default function Home({ user }) {
  const navigate = useNavigate();

  const createRoom = () => {
    const id = uuidv4().substring(0, 8);
    navigate(`/game/${id}`);
  };

  const playAi = () => {
    navigate('/game/solo');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#161512', color: '#fff' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '10px' }}>♚ CHESS PREMIUM ♚</h1>
      <p style={{ color: '#999', marginBottom: '40px' }}>Welcome, {user.email}</p>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button 
          onClick={createRoom}
          style={{ padding: '20px 40px', fontSize: '18px', backgroundColor: '#b58863', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Users size={24}/> Play with Friend
        </button>
        
        <button 
          onClick={playAi}
          style={{ padding: '20px 40px', fontSize: '18px', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Cpu size={24}/> Play vs AI
        </button>
      </div>

      <button 
        onClick={() => auth.signOut()}
        style={{ marginTop: '50px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
      >
        <LogOut size={18}/> Sign Out
      </button>
    </div>
  );
}
