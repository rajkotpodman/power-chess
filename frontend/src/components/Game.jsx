import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { Share2, Copy, Home, MessageSquare, Send } from 'lucide-react';

export default function Game({ user, isAiMode }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [gameFen, setGameFen] = useState('start');
  const chessRef = useRef(new Chess());
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null); // ચેટ ઓટો-સ્ક્રોલ કરવા માટે
  
  const [moveFrom, setMoveFrom] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  // ચેટ માટેના નવા સ્ટેટ્સ
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (!isAiMode) {
      socketRef.current = io('http://localhost:3000');
      socketRef.current.emit('joinRoom', roomId);

      // ૧. વિરોધીનો ચેસ મૂવ સાંભળવા માટે
      socketRef.current.on('oppMove', (moveData) => {
        try {
          chessRef.current.move(moveData);
          setGameFen(chessRef.current.fen());
        } catch (err) {
          console.error("Opponent move error:", err);
        }
      });

      // ૨. રિયલ-ટાઇમ ચેટ મેસેજ સાંભળવા માટે (નવો લિસનર)
      socketRef.current.on('chatMessage', (msgData) => {
        setMessages((prev) => [...prev, msgData]);
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [roomId, isAiMode]);

  // નવો મેસેજ આવે ત્યારે ચેટ બોક્સ આપોઆપ નીચે સ્ક્રોલ થઈ જશે
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // મેસેજ મોકલવા માટેનું ફંક્શન
  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const msgData = {
      text: inputMessage,
      sender: user?.email || 'Player',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // લોકલ સ્ટેટમાં ઉમેરો
    setMessages((prev) => [...prev, msgData]);

    // સોકેટ દ્વારા બીજા પ્લેયરને મોકલો
    if (socketRef.current) {
      socketRef.current.emit('sendChatMessage', { roomId, msgData });
    }

    setInputMessage('');
  };

  // AI લોજિક (તમારું જે હતું તે જ રાખ્યું છે)
  const evaluateBoard = (chess) => {
    const weights = { p: 10, n: 30, b: 30, r: 50, q: 90, k: 900 };
    let totalEvaluation = 0;
    const board = chess.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const val = weights[piece.type];
          totalEvaluation += (piece.color === 'w' ? val : -val);
        }
      }
    }
    return totalEvaluation;
  };

  const makeAiMove = () => {
    if (chessRef.current.isGameOver()) return;
    const moves = chessRef.current.moves();
    let bestMove = null;
    let bestValue = Infinity;

    for (const move of moves) {
      chessRef.current.move(move);
      const boardValue = evaluateBoard(chessRef.current);
      chessRef.current.undo();
      if (boardValue < bestValue) {
        bestValue = boardValue;
        bestMove = move;
      }
    }
    chessRef.current.move(bestMove || moves[0]);
    setGameFen(chessRef.current.fen());
  };

  const handleSquareClick = (square) => {
    if (chessRef.current.isGameOver()) return;

    if (!moveFrom) {
      const piece = chessRef.current.get(square);
      if (piece && piece.color === (chessRef.current.turn())) {
        setMoveFrom(square);
      }
      return;
    }

    try {
      const moveData = { from: moveFrom, to: square, promotion: 'q' };
      const move = chessRef.current.move(moveData);

      if (move) {
        setGameFen(chessRef.current.fen());
        if (!isAiMode && socketRef.current) {
          socketRef.current.emit('chessMove', { roomId, moveData });
        } else if (isAiMode) {
          setTimeout(makeAiMove, 500);
        }
      }
    } catch (error) {
      console.log("❌ Invalid Move!");
    }
    setMoveFrom('');
  };

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Room link copied!");
  };

  const shareToWhatsApp = () => {
    const text = `Join my chess game! ${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFB = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const rows = ['8', '7', '6', '5', '4', '3', '2', '1'];
  const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const getPieceImage = (square) => {
    const piece = chessRef.current.get(square);
    if (!piece) return null;
    const pieceCode = `${piece.color}${piece.type.toUpperCase()}`;
    const pieceUrls = {
      wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
      wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
      wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
      wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
      wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
      wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
      bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
      bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
      bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
      bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
      bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
      bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg'
    };
    return <img src={pieceUrls[pieceCode]} style={{ width: '90%', height: '90%' }} alt={pieceCode} />;
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#161512', minHeight: '100vh', color: '#fff' }}>
      
      {/* હેડર સેક્શન */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '960px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><Home size={24}/></button>
        <h2 style={{ margin: 0 }}>{isAiMode ? 'Solo vs AI' : 'Multiplayer Room'}</h2>
        {!isAiMode && (
          <button onClick={() => setShowShareModal(true)} style={{ background: 'none', border: 'none', color: '#b58863', cursor: 'pointer' }}><Share2 size={24}/></button>
        )}
      </div>

      {/* મેઈન ગેમ કન્ટેનર: બોર્ડ અને ચેટ બંને લાઇન-સર ગોઠવાઈ જશે */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '960px' }}>
        
        {/* ચેસ બોર્ડ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 60px)', border: '8px solid #2a1f12', borderRadius: '4px', height: '480px' }}>
          {rows.map((row, rIdx) => 
            cols.map((col, cIdx) => {
              const square = `${col}${row}`;
              const isLight = (rIdx + cIdx) % 2 === 0;
              const isSelected = moveFrom === square;
              return (
                <div 
                  key={square} 
                  onClick={() => handleSquareClick(square)}
                  style={{ 
                    width: 60, height: 60, backgroundColor: isSelected ? '#f7f769' : (isLight ? '#f0d9b5' : '#b58863'),
                    display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer'
                  }}
                >
                  {getPieceImage(square)}
                </div>
              );
            })
          )}
        </div>

        {/* 💬 એડવાન્સ લાઈવ ચેટ બોક્સ (ફક્ત મલ્ટિપ્લેયર મોડમાં જ દેખાશે) */}
        {!isAiMode && (
          <div style={{ width: '340px', height: '496px', backgroundColor: '#262421', borderRadius: '8px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
            <div style={{ padding: '15px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#1f1e1b', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
              <MessageSquare size={18} style={{ color: '#b58863' }} />
              <span style={{ fontWeight: 'bold' }}>Room Chat</span>
            </div>

            {/* મેસેજ લિસ્ટ એરિયા */}
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>No messages yet. Say hello!</p>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender === user?.email;
                  return (
                    <div key={index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                      <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px', textAlign: isMe ? 'right' : 'left' }}>
                        {isMe ? 'You' : msg.sender.split('@')[0]}
                      </div>
                      <div style={{ backgroundColor: isMe ? '#b58863' : '#333', color: '#fff', padding: '8px 12px', borderRadius: '12px', borderTopRightRadius: isMe ? '0px' : '12px', borderTopLeftRadius: isMe ? '12px' : '0px', fontSize: '14px', wordBreak: 'break-word' }}>
                        {msg.text}
                      </div>
                      <div style={{ fontSize: '9px', color: '#666', marginTop: '2px', textAlign: isMe ? 'right' : 'left' }}>
                        {msg.time}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ઇનપુટ બોક્સ */}
            <form onSubmit={sendMessage} style={{ padding: '10px', borderTop: '1px solid #333', display: 'flex', gap: '8px', backgroundColor: '#1f1e1b', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#262421', color: '#fff', fontSize: '14px' }}
              />
              <button type="submit" style={{ padding: '10px 14px', backgroundColor: '#b58863', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* શેર મોડલ (તમારું જે હતું તે જ રાખ્યું છે) */}
      {showShareModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: '#262421', padding: '30px', borderRadius: '8px', textAlign: 'center', width: '300px' }}>
            <h3>Invite Friend</h3>
            <p style={{ color: '#999', fontSize: '14px' }}>Share this link to play together:</p>
            <div style={{ display: 'flex', background: '#333', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
              <input readOnly value={window.location.href} style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: '12px' }} />
              <button onClick={copyLink} style={{ background: 'none', border: 'none', color: '#b58863', cursor: 'pointer' }}><Copy size={18}/></button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={shareToWhatsApp} style={{ flex: 1, padding: '8px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>WhatsApp</button>
              <button onClick={shareToFB} style={{ flex: 1, padding: '8px', backgroundColor: '#1877F2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Facebook</button>
            </div>

            <button onClick={() => setShowShareModal(false)} style={{ width: '100%', padding: '10px', backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}