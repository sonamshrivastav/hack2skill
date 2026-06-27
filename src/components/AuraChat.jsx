import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Brain, Clock, ShieldAlert, Heart, RefreshCw, Loader2 } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  { text: "Help me reframe my negative thought", icon: '🧠', tag: 'reframe' },
  { text: "I scored badly on my mock test", icon: '📉', tag: 'mock' },
  { text: "I feel too tired to focus tonight", icon: '🥱', tag: 'tired' },
  { text: "My parents expect too much", icon: '🏠', tag: 'parents' }
];

export default function AuraChat({ geminiService, user, chatLog, onSendMessage, onClearChat, logs, patternsData }) {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isTyping]);

  const handleSend = async (textToSend) => {
    const message = textToSend || inputText;
    if (!message.trim()) return;

    if (!textToSend) setInputText('');

    // 1. Add user message to chat history
    onSendMessage({
      sender: 'user',
      text: message.trim(),
      timestamp: new Date().toISOString()
    });

    setIsTyping(true);

    try {
      // 2. Call service (it uses current logs context + new message + patterns)
      const reply = await geminiService.talkToAura(chatLog, message, user.exam, user.name, logs, patternsData);
      
      // 3. Add Aura's reply
      onSendMessage({
        sender: 'aura',
        text: reply,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      onSendMessage({
        sender: 'aura',
        text: "I'm having a brief sync lag, but I'm here. Take a slow deep breath. Tell me, how are your shoulders feeling? Try loosening them.",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 120px)',
      gap: '16px'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Aura <span style={{ fontSize: '0.8rem', background: 'var(--color-primary-glow)', color: 'var(--color-primary)', border: '1px solid var(--border-glow)', padding: '2px 8px', borderRadius: '12px' }}>AI Companion</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>An empathetic, always-available digital companion throughout your exam journey.</p>
        </div>
        <button
          onClick={onClearChat}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', gap: '6px', alignItems: 'center' }}
          title="Clear Conversation"
        >
          <RefreshCw size={12} /> Clear Chat
        </button>
      </div>

      {/* Main Chat Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3fr 1fr',
        gap: '20px',
        flex: 1,
        minHeight: 0 // Crucial for inner scrollbars
      }}>
        
        {/* Chat Feed Column */}
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
          padding: '20px'
        }}>
          
          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            paddingRight: '8px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            
            {/* System Initial Message */}
            <div style={{
              alignSelf: 'flex-start',
              maxWidth: '80%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-glow)',
              padding: '16px',
              borderRadius: '16px 16px 16px 4px',
              color: 'var(--text-muted)',
              fontSize: '0.92rem',
              lineHeight: '1.5'
            }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#fff', fontWeight: 'bold', marginBottom: '6px' }}>
                <Sparkles size={14} style={{ color: 'var(--color-accent-teal)' }} /> Aura Companion
              </div>
              Hi {user?.name}, I am Aura. Preparing for {user?.exam} is a demanding journey that takes both mental and emotional stamina. I'm here to support you. You can vent about mock scores, talk about burnout, or request mindfulness activities. What's on your mind?
            </div>

            {/* Render Log Messages */}
            {chatLog.map((msg, i) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={i} 
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: isUser 
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, hsl(280, 80%, 50%) 100%)' 
                      : 'var(--panel-bg-hover)',
                    border: isUser ? 'none' : '1px solid var(--border-glow)',
                    boxShadow: isUser ? '0 4px 12px var(--color-primary-glow)' : 'none',
                    padding: '14px 18px',
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    color: '#fff',
                    fontSize: '0.92rem',
                    lineHeight: '1.5',
                    wordBreak: 'break-word',
                    animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                  }}
                >
                  {!isUser && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-accent-teal)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Aura
                    </div>
                  )}
                  {msg.text}
                </div>
              );
            })}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'var(--panel-bg-hover)',
                border: '1px solid var(--border-glow)',
                padding: '12px 18px',
                borderRadius: '16px 16px 16px 4px',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Loader2 size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                <span>Aura is reflecting...</span>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form Area */}
          <div style={{
            display: 'flex',
            gap: '12px',
            background: 'rgba(0,0,0,0.15)',
            padding: '8px',
            borderRadius: '12px',
            border: '1px solid var(--border-glow)'
          }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message, venting, or questions here..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.98rem',
                padding: '10px 14px',
                outline: 'none'
              }}
              disabled={isTyping}
            />
            <button
              onClick={() => handleSend()}
              className="btn-primary"
              style={{ 
                padding: '10px 20px', 
                borderRadius: '8px',
                opacity: (isTyping || !inputText.trim()) ? 0.6 : 1,
                cursor: (isTyping || !inputText.trim()) ? 'not-allowed' : 'pointer'
              }}
              disabled={isTyping || !inputText.trim()}
            >
              Send <Send size={14} />
            </button>
          </div>

        </div>

        {/* Sidebar Info/Prompts Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Presets */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Brain size={16} style={{ color: 'var(--color-primary)' }} /> Quick Prompts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.text)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-glow)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    textAlign: 'left',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.borderColor = 'var(--text-muted)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'var(--border-glow)';
                  }}
                  disabled={isTyping}
                >
                  <span style={{ fontSize: '1.1rem' }}>{prompt.icon}</span>
                  <span style={{ lineHeight: '1.3' }}>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid var(--color-accent-amber)' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <ShieldAlert size={16} style={{ color: 'var(--color-accent-amber)' }} /> Academic Safety
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>
              Aura is a digital peer coach supporting your mindset. It does not replace professional guidance. If you feel overwhelmed, talk to a mentor or family member, or call counseling resources.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
