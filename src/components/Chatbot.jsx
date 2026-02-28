import { useState, useEffect, useRef } from 'react'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const SYSTEM_PROMPT = `You are Priya, the warm and knowledgeable virtual assistant for Bharat Abroad — a premium Indian cultural event management company. 

Your personality:
- Warm, gracious, and culturally aware — like a knowledgeable friend who loves Indian culture
- Use occasional gentle cultural references (e.g. "Namaste!", "It would be our honour", "like a truly grand celebration")
- Professional yet personal — never robotic
- Enthusiastic about Indian traditions, weddings, festivals, and celebrations
- Keep responses concise (2-4 sentences max) unless the user asks for details

About Bharat Abroad:
- Premium event management for Indian cultural events globally
- Services: Weddings (traditional & contemporary), Cultural Events (Diwali, Holi, Navratri), Corporate Galas, Festivals, Private Parties
- 500+ events managed, 25+ countries served, 98% client satisfaction, 10+ years experience
- Contact: hello@bharatabroad.com | +1 (234) 567-890
- Based in Mumbai, India — but serve clients worldwide

What you can help with:
- Information about services and what's included
- General event planning advice
- Explaining Indian wedding traditions and cultural events
- Helping users figure out which service fits their needs
- Encouraging them to fill in the contact form for a proper consultation

When someone wants to book or get a quote, always guide them to fill out the contact form on the page.
Never make up specific prices — say pricing depends on the event scope and encourage them to get in touch.
Always end conversations warmly.`

const SUGGESTED_QUESTIONS = [
  'What services do you offer?',
  'How do I plan an Indian wedding abroad?',
  'What\'s included in your packages?',
  'Which countries do you serve?',
]

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! 🙏 I\'m Priya, your Bharat Abroad assistant. Whether you\'re dreaming of a grand wedding or a vibrant cultural celebration, I\'m here to help. What can I do for you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Show unread badge after 8s if chat not opened
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open) setUnread(1)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText) return

    setShowSuggestions(false)
    setInput('')
    setLoading(true)

    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 300,
          temperature: 0.7,
        })
      })

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again or contact us directly at hello@bharatabroad.com 🙏"

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a little trouble connecting right now. Please reach out to us directly at hello@bharatabroad.com or call +1 (234) 567-890. We'd love to hear from you! 🙏"
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* ── CHAT WINDOW ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '1.5rem', zIndex: 1000,
          width: 360, maxHeight: '70vh',
          background: 'white', borderRadius: '1.5rem',
          boxShadow: '0 24px 80px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden', border: '1px solid #F0E8E8',
          animation: 'chatSlideUp 0.3s ease',
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #8B1A2F, #C84B6E)',
            padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', border: '2px solid rgba(255,255,255,0.3)',
              flexShrink: 0,
            }}>🪷</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif" }}>Priya</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
                Bharat Abroad Assistant
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
              width: 30, height: 30, color: 'white', cursor: 'pointer', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                gap: '0.5rem', alignItems: 'flex-end',
              }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A2F, #C84B6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>🪷</div>
                )}
                <div style={{
                  maxWidth: '78%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #8B1A2F, #C84B6E)' : '#F7F4F2',
                  color: msg.role === 'user' ? 'white' : '#1A0A0F',
                  fontSize: '0.85rem', lineHeight: 1.6,
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: msg.role === 'user' ? '0 4px 16px rgba(139,26,47,0.25)' : 'none',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #8B1A2F, #C84B6E)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🪷</div>
                <div style={{ background: '#F7F4F2', borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem', padding: '0.75rem 1rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: '#8B1A2F',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}></div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested questions */}
            {showSuggestions && messages.length === 1 && !loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                <div style={{ fontSize: '0.7rem', color: '#aaa', paddingLeft: '2.25rem', fontFamily: "'DM Sans', sans-serif" }}>Quick questions:</div>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} style={{
                    marginLeft: '2.25rem', background: 'white', border: '1px solid #E8D5D8',
                    borderRadius: 100, padding: '0.45rem 0.875rem', fontSize: '0.75rem',
                    color: '#8B1A2F', cursor: 'pointer', textAlign: 'left',
                    fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.target.style.background = '#8B1A2F'; e.target.style.color = 'white' }}
                    onMouseLeave={e => { e.target.style.background = 'white'; e.target.style.color = '#8B1A2F' }}
                  >{q}</button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '0.875rem', borderTop: '1px solid #F0E8E8', display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              rows={1}
              style={{
                flex: 1, padding: '0.7rem 0.875rem', borderRadius: '1rem',
                border: '1px solid #E8E0E0', fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.85rem', outline: 'none', resize: 'none',
                lineHeight: 1.5, maxHeight: 80, overflowY: 'auto',
                background: '#FAFAFA',
              }}
              onFocus={e => e.target.style.borderColor = '#8B1A2F'}
              onBlur={e => e.target.style.borderColor = '#E8E0E0'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: input.trim() ? 'linear-gradient(135deg, #8B1A2F, #C84B6E)' : '#F0E8E8',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                color: input.trim() ? 'white' : '#ccc',
                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', boxShadow: input.trim() ? '0 4px 16px rgba(139,26,47,0.3)' : 'none',
              }}
            >✈</button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.65rem', color: '#ccc', fontFamily: "'DM Sans', sans-serif", background: '#FAFAFA' }}>
            Powered by AI · Bharat Abroad 🪷
          </div>
        </div>
      )}

      {/* ── CHAT BUTTON ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000,
          width: 60, height: 60, borderRadius: '50%',
          background: open ? '#1A0A0F' : 'linear-gradient(135deg, #8B1A2F, #C84B6E)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(139,26,47,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', transition: 'all 0.3s',
          animation: !open ? 'pulse 2.5s ease-in-out infinite' : 'none',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {open ? '✕' : '💬'}
        {unread > 0 && !open && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 20, height: 20, borderRadius: '50%',
            background: '#E8A020', color: 'white',
            fontSize: '0.65rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
          }}>{unread}</div>
        )}
      </button>

      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(139,26,47,0.4); }
          50% { box-shadow: 0 8px 48px rgba(139,26,47,0.7); }
        }
      `}</style>
    </>
  )
}
