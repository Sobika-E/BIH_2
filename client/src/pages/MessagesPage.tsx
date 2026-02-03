import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../app/api/http'
import { useAuth } from '../app/auth/AuthContext'

type Message = {
  id: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
}

type User = {
  id: string
  name: string
  department: string
  year: number
  skills: string[]
}

export function MessagesPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { state } = useAuth()
  const currentUser = state.status === 'authenticated' ? state.user : null
  
  const [recipient, setRecipient] = useState<User | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (!userId || !currentUser) return

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/api/messages/with/${userId}`)
        setRecipient(response.data.user)
        setMessages(response.data.messages)
        scrollToBottom()
      } catch (error) {
        console.error('Error fetching messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [userId, currentUser])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId || !currentUser) return

    try {
      const response = await api.post('/api/messages/send', {
        recipientId: userId,
        content: newMessage.trim()
      })
      
      setMessages(prev => [...prev, response.data.message])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!recipient) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-500">User not found</div>
        <button 
          onClick={() => navigate('/contributors')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to contributors
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="border-b border-neutral-200 p-4 bg-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/contributors')}
            className="p-2 rounded-lg hover:bg-neutral-100"
          >
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-neutral-900">{recipient.name}</h2>
            <div className="text-sm text-neutral-500">
              {recipient.department} · Year {recipient.year}
            </div>
            {recipient.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {recipient.skills.slice(0, 3).map(skill => (
                  <span 
                    key={skill} 
                    className="px-2 py-0.5 bg-primary-100 text-primary-800 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {recipient.skills.length > 3 && (
                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                    +{recipient.skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <div className="mb-2">No messages yet</div>
            <div className="text-sm">Start the conversation!</div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.senderId === currentUser?.id
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-white text-neutral-900 rounded-bl-md border border-neutral-200'
                }`}
              >
                <div className="text-sm">{message.content}</div>
                <div 
                  className={`text-xs mt-1 ${
                    message.senderId === currentUser?.id ? 'text-primary-100' : 'text-neutral-500'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-neutral-200 p-4 bg-white rounded-b-2xl">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-xl border border-neutral-200 px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}