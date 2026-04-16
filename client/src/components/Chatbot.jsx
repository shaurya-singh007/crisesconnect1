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

const responses = {
  'shelter': `🏠 **Nearest Shelters:**\n\n1. **Gandhi Stadium Relief Camp** — 2.3 km away\n   📍 Gandhi Nagar, Open 24/7\n   📞 +91-112-SHELTER\n\n2. **Community Hall** — 3.8 km\n   📍 MG Road, Capacity: 500\n\n3. **Government School** — 4.1 km\n   📍 Station Road\n\nStay safe and carry essentials. Use the Live Map for route guidance.`,

  'report': `📋 **How to Report a Crisis:**\n\n1. Click **"Report Crisis"** in the sidebar\n2. Step 1: Select crisis type and describe\n3. Step 2: Mark location and severity\n4. Step 3: Add photos and submit\n\n⚡ Takes less than 2 minutes!\n\nYou can also report anonymously for sensitive situations.`,

  'helpline': `📞 **Emergency Helplines:**\n\n🚨 National Emergency: **112**\n🚑 Ambulance: **108**\n🔥 Fire: **101**\n👮 Police: **100**\n🆘 NDMA: **1078**\n🩺 Health: **104**\n👩 Women Helpline: **181**\n👶 Child Helpline: **1098**\n\nSave these numbers offline!`,

  'volunteer': `🙋 **How to Volunteer:**\n\n1. Go to **Volunteer Hub** in sidebar\n2. Click **"Register as Volunteer"**\n3. Fill your name, skills, and location\n4. Browse the **Task Board** for open tasks\n5. Use **Skill Matching** to find best-fit assignments\n\nYour skills can save lives. Join us today!`,

  'first aid': `🩹 **Basic First Aid Tips:**\n\n**Bleeding:** Apply firm pressure with clean cloth\n**Burns:** Cool with running water for 10+ min\n**Choking:** 5 back blows, then 5 abdominal thrusts\n**CPR:** 30 compressions, 2 breaths. Repeat.\n**Fracture:** Immobilize, don't straighten\n**Drowning:** Check breathing, start CPR if needed\n\n⚠️ Always call **108** for serious emergencies.`,

  'evacuation': `🚗 **Evacuation Guidelines:**\n\n1. **Listen** to official alerts on this platform\n2. **Pack** essentials: water, food, medicine, ID, phone charger\n3. **Follow** marked evacuation routes on the Live Map\n4. **Head** to nearest shelter (check Shelters on map)\n5. **Don't** return until authorities declare safe\n\n📍 Open the **Live Crisis Map** for real-time route info.`,

  'default': `I'm your CrisisConnect AI Assistant. I can help with:\n\n🏠 Finding shelters\n📋 Reporting crises\n📞 Emergency helplines\n🙋 Volunteering\n🩹 First aid tips\n🚗 Evacuation routes\n\nType your question or use the quick actions below!`
}

function getResponse(input) {
  const lower = input.toLowerCase()
  if (lower.includes('shelter') || lower.includes('camp') || lower.includes('safe')) return responses.shelter
  if (lower.includes('report') || lower.includes('submit')) return responses.report
  if (lower.includes('helpline') || lower.includes('emergency') || lower.includes('phone') || lower.includes('call') || lower.includes('number')) return responses.helpline
  if (lower.includes('volunteer') || lower.includes('help') || lower.includes('join')) return responses.volunteer
  if (lower.includes('first aid') || lower.includes('medical') || lower.includes('injury') || lower.includes('bleed') || lower.includes('burn')) return responses['first aid']
  if (lower.includes('evacuat') || lower.includes('route') || lower.includes('leave') || lower.includes('escape')) return responses.evacuation
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) return `👋 Hello! I'm the CrisisConnect AI Assistant. How can I help you during this crisis?\n\n${responses.default}`
  if (lower.includes('thank')) return `You're welcome! Stay safe. Remember:\n🚨 Emergency: 112\n🚑 Ambulance: 108\n\nI'm always here if you need help.`
  return `I understand you're asking about "${input}". Here's what I can help with:\n\n${responses.default}`
}

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

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { type: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response = getResponse(text)
      setMessages(prev => [...prev, { type: 'bot', text: response }])
      setTyping(false)
    }, 800 + Math.random() * 700)
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
