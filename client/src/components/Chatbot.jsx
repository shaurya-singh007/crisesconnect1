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

// ── Client-side Gemini fallback (works without server) ──
const GEMINI_API_KEY = 'AIzaSyCbgT8lKeXz1wjP-GlOidb-8Z-3j3xTZqE'

const SYSTEM_PROMPT = `You are the CrisisConnect AI Assistant, an expert emergency response and disaster management AI.
Your primary job is to provide accurate, calm, and helpful information during crises.
Be concise, practical, and empathetic. Format your responses with Markdown for readability (use bold text and emojis where appropriate).
If asked about shelters, reporting a crisis, volunteering, or evacuation routes, provide helpful general guidance and suggest using the CrisisConnect platform features.
If you don't know the answer or the situation sounds like a medical/life-threatening emergency, ALWAYS advise the user to call 112 (National Emergency) or 108 (Ambulance).
Keep responses under 150 words when possible for quick reading.`

async function callGeminiDirect(message, history) {
  // Build contents array for Gemini
  const contents = []

  // Add history (skip initial bot welcome)
  for (const msg of history) {
    const role = msg.type === 'bot' ? 'model' : 'user'
    if (contents.length === 0 && role === 'model') continue
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += '\n\n' + msg.text
    } else {
      contents.push({ role, parts: [{ text: msg.text }] })
    }
  }

  // Add current message
  contents.push({ role: 'user', parts: [{ text: message }] })

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: 300, temperature: 0.4 }
    })
  })

  const data = await resp.json()
  if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
    return data.candidates[0].content.parts[0].text
  }
  throw new Error(data.error?.message || 'No response from Gemini')
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
      // Try server first
      let responseText
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: messageText, history: messages })
        })
        if (!response.ok) throw new Error('Server error')
        const data = await response.json()
        responseText = data.response
      } catch (serverErr) {
        // Fallback: call Gemini directly from browser
        console.log('Server unreachable, using direct Gemini API...')
        responseText = await callGeminiDirect(messageText, messages)
      }

      const botMsg = { type: 'bot', text: responseText }
      setMessages(prev => [...prev, botMsg])
      setTyping(false)
      speak(responseText)
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = { 
        type: 'bot', 
        text: "I'm sorry, I'm having trouble connecting right now. Please try again or call **112** for immediate emergencies." 
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
