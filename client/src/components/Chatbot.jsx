import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot } from 'lucide-react'

const quickActions = [
  'Find nearest shelter',
  'How to report crisis?',
  'Emergency helplines',
  'How to volunteer?',
  'First aid tips',
  'Evacuation routes'
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'bot', text: `👋 Welcome to **CrisisConnect AI Assistant**!\n\nI'm here to help you 24/7. Ask me about shelters, helplines, volunteering, or anything crisis-related.` }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const userMsg = { type: 'user', text }
    
    // Copy history up to the last 10 messages to send to the AI
    const history = messages.slice(-10)

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { type: 'bot', text: data.response }])
    } catch (e) {
      setMessages(prev => [...prev, { type: 'bot', text: 'Sorry, I am having trouble connecting to the network right now.' }])
    } finally {
      setTyping(false)
    }
  }

  const handleQuickAction = (action) => {
    sendMessage(action)
  }

  const formatText = (text) => {
    return text.split('\n').map((line, i) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return <span key={i} dangerouslySetInnerHTML={{ __html: line }} style={{ display: 'block', minHeight: line === '' ? '8px' : 'auto' }} />
    })
  }

  return (
    <>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar"><Bot size={20} /></div>
              <div>
                <h4>AI Assistant</h4>
                <span className="online">● Online</span>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.type}`}>
                {formatText(msg.text)}
              </div>
            ))}
            {typing && (
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            {quickActions.map(a => (
              <button key={a} className="quick-action-btn" onClick={() => handleQuickAction(a)}>{a}</button>
            ))}
          </div>

          <div className="chatbot-input-area">
            <input
              className="chatbot-input"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            />
            <button className="chatbot-send" onClick={() => sendMessage(input)}><Send size={18} /></button>
          </div>
        </div>
      )}

      <button className="chatbot-trigger" onClick={() => setIsOpen(!isOpen)} title="AI Assistant">
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  )
}
