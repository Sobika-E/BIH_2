import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../app/api/http'
import { useAuth } from '../app/auth/AuthContext'

type Conversation = {
  id: string
  name: string
  department: string
  year: number
  skills: string[]
  unreadCount: number
  lastMessage: {
    content: string
    createdAt: string
  } | null
}

export function MessagesListPage() {
  const { state } = useAuth()
  const user = state.status === 'authenticated' ? state.user : null
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchConversations = async () => {
      try {
        setLoading(true)
        const response = await api.get('/api/messages/conversations')
        setConversations(response.data.conversations)
      } catch (error) {
        console.error('Error fetching conversations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-6 shadow-sm">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-neutral-900">Messages</h1>
          <p className="text-neutral-600">Your conversations with community members</p>
        </div>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
              <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">No conversations yet</h3>
            <p className="mb-4 text-neutral-600">
              Start a conversation by messaging contributors from the contributors page.
            </p>
            <Link
              to="/contributors"
              className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:shadow-lg"
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a1 1 0 001-1V9a1 1 0 00-1-1h-4a1 1 0 00-1 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Browse Contributors
            </Link>
          </div>
        ) : (
          conversations.map((conversation) => (
            <Link
              key={conversation.id}
              to={`/messages/${conversation.id}`}
              className="block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 font-bold text-white">
                    {conversation.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-neutral-900">{conversation.name}</h3>
                    {conversation.lastMessage && (
                      <span className="whitespace-nowrap text-xs text-neutral-500">
                        {new Date(conversation.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="mb-2 text-sm text-neutral-600">
                    {conversation.department} · Year {conversation.year}
                  </p>
                  
                  {conversation.skills.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {conversation.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-800">
                          {skill}
                        </span>
                      ))}
                      {conversation.skills.length > 3 && (
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                          +{conversation.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                  
                  {conversation.lastMessage ? (
                    <p className="truncate text-sm text-neutral-700">
                      {conversation.lastMessage.content}
                    </p>
                  ) : (
                    <p className="italic text-sm text-neutral-500">
                      No messages yet
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}