import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'

const quickActions = [
  'Find nearest shelter',
  'How to report crisis?',
  'Emergency helplines',
  'How to volunteer?',
  'First aid tips',
  'Evacuation routes'
]

// Web Speech API - Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = SpeechRecognition ? new SpeechRecognition() : null

if (recognition) {
  recognition.continuous = false
  recognition.interimResults = false
  recognition.lang = 'en-US'
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { type: 'bot', text: `👋 Welcome to **CrisisConnect AI Assistant**!\n\nI'm here to help you 24/7. Ask me about shelters, helplines, volunteering, or anything crisis-related.` }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Listen for external open event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open_chatbot', handleOpen)
    return () => window.removeEventListener('open_chatbot', handleOpen)
  }, [])

  // Setup Speech Recognition
  useEffect(() => {
    if (!recognition) return

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsListening(false)
      // Automatically send if voice mode is active
      sendMessage(transcript)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop()
      setIsListening(false)
    } else {
      try {
        recognition?.start()
        setIsListening(true)
      } catch (err) {
        console.error('Failed to start recognition:', err)
      }
    }
  }

  // Text-to-Speech function
  const speak = (text) => {
    if (!isVoiceMode) return
    
    // Stop any current speaking
    window.speechSynthesis.cancel()

    // Clean markdown for better speech
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/#/g, '')
      .replace(/🚨|🏠|📋|📞|🙋|🩹|🚗|👋|⚠️/g, '')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    
    // Pick a natural voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'))
    if (preferredVoice) utterance.voice = preferredVoice

    window.speechSynthesis.speak(utterance)
  }

  const sendMessage = async (text) => {
    const messageText = text || input
    if (!messageText.trim()) return
    
    // Quick command check for navigation
    const lowerText = messageText.toLowerCase()
    if (lowerText.includes('go to map') || lowerText.includes('show map') || lowerText.includes('open map')) {
      setMessages(prev => [...prev, { type: 'user', text: messageText }, { type: 'bot', text: 'Sure! Taking you to the Live Crisis Map.' }])
      setInput('')
      setTimeout(() => window.location.href = '/map', 1000)
      return
    }
    if (lowerText.includes('go to report') || lowerText.includes('report crisis') || lowerText.includes('report incident')) {
      setMessages(prev => [...prev, { type: 'user', text: messageText }, { type: 'bot', text: 'Opening the Crisis Reporting page.' }])
      setInput('')
      setTimeout(() => window.location.href = '/report', 1000)
      return
    }
    if (lowerText.includes('go to dashboard') || lowerText.includes('open dashboard')) {
      setMessages(prev => [...prev, { type: 'user', text: messageText }, { type: 'bot', text: 'Navigating to the Command Dashboard.' }])
      setInput('')
      setTimeout(() => window.location.href = '/dashboard', 1000)
      return
    }
    if (lowerText.includes('go to volunteers') || lowerText.includes('open volunteers')) {
      setMessages(prev => [...prev, { type: 'user', text: messageText }, { type: 'bot', text: 'Heading to the Volunteer Hub.' }])
      setInput('')
      setTimeout(() => window.location.href = '/volunteers', 1000)
      return
    }

    const userMsg = { type: 'user', text: messageText }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      // Use the actual Gemini API from the backend
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          history: messages 
        })
      })

      const data = await response.json()
      const botMsg = { type: 'bot', text: data.response }
      
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
      
      // Speak the response if voice mode is on
      speak(data.response)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = { 
        type: 'bot', 
        text: "I'm sorry, I'm having trouble connecting to the AI brain. Please try again or call 112 for immediate emergencies." 
      }
      setMessages(prev => [...prev, errorMsg])
      setTyping(false)
      speak(errorMsg.text)
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
            <div className="chatbot-header-actions">
              <button 
                className={`chatbot-voice-toggle ${isVoiceMode ? 'active' : ''}`}
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                title={isVoiceMode ? "Disable Voice" : "Enable Voice"}
              >
                {isVoiceMode ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              <button className="chatbot-close" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
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
            <button 
              className={`chatbot-mic ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title="Voice Search"
            >
              {isListening ? <Mic size={20} className="pulse-icon" /> : <Mic size={20} />}
            </button>
            <input
              className="chatbot-input"
              placeholder={isListening ? "Listening..." : "Ask anything..."}
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
