import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../app/api/http'
import { useAuth } from '../app/auth/AuthContext'

const CATEGORIES = [
  { id: '', name: 'All Topics', icon: '📌' },
  { id: 'Subjects', name: 'Subjects', icon: '📚' },
  { id: 'Placements', name: 'Placements', icon: '💼' },
  { id: 'Exams', name: 'Exams', icon: '📝' },
  { id: 'Labs', name: 'Labs', icon: '🔬' },
  { id: 'Projects', name: 'Projects', icon: '🚀' },
  { id: 'NSS / Activities', name: 'NSS / Activities', icon: '🎯' },
] as const

const COMMUNITIES = [
  { id: 'main', name: 'DoubtConnect Main', description: 'Main Q&A community', icon: '💬' },
  { id: 'cse', name: 'CSE Community', description: 'Computer Science & Engineering', icon: '💻' },
  { id: 'ece', name: 'ECE Community', description: 'Electronics & Communication', icon: '📡' },
  { id: 'general', name: 'General Study', description: 'Exams & study tips', icon: '📖' },
] as const

type FeedQuestion = {
  id: string
  title: string
  descriptionPreview: string
  category: string
  tags: string[]
  createdAt: string
  answersCount: number
  hasAcceptedAnswer: boolean
  likesCount: number
  author: { id: string; name: string; year: number } | null
}

export function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') ?? ''
  const selectedCategory = categoryParam && CATEGORIES.some((c) => c.id === categoryParam) ? categoryParam : ''

  const [showUnanswered, setShowUnanswered] = useState(false)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<FeedQuestion[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])
  const [showJoinModal, setShowJoinModal] = useState<{ communityId: string; communityName: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const extractedHashtags = (q.match(/#[\w]+/g) || []).map((tag) => tag.substring(1).toLowerCase())
    setHashtags(extractedHashtags)
  }, [q])

  const query = useMemo(
    () => ({
      q: q.replace(/#[\w]+/g, '').trim(),
      category: selectedCategory || undefined,
      tags: hashtags.length > 0 ? hashtags : undefined,
      unanswered: showUnanswered ? 'true' : undefined,
    }),
    [q, selectedCategory, hashtags, showUnanswered],
  )
  const { state, refreshMe } = useAuth()
  const me = state.status === 'authenticated' ? state.user : null
  const [joining, setJoining] = useState(false)

  const setCategory = (categoryId: string) => {
    if (categoryId) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('category', categoryId)
        return next
      })
    } else {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('category')
        return next
      })
    }
  }

  const handleCommunityClick = (community: (typeof COMMUNITIES)[number]) => {
    if (!me) return
    if (!me.joinedCommunity) {
      setShowJoinModal({ communityId: community.id, communityName: community.name })
    }
    // If already joined, stay on feed (category filter can still apply)
  }

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .get<{ questions: FeedQuestion[] }>('/api/questions', { params: query })
      .then((r) => {
        if (!mounted) return
        setItems(r.data.questions)
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [query])

  const joinCommunity = async () => {
    try {
      setJoining(true)
      await api.post('/api/membership/join')
      await refreshMe()
      setShowJoinModal(null)
    } finally {
      setJoining(false)
    }
  }

  const sidebarContent = (
    <>
      <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4">
        <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Categories</h2>
        <nav className="flex flex-col gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id || 'all'}
              type="button"
              onClick={() => {
                setCategory(cat.id)
                setSidebarOpen(false)
              }}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all md:gap-3 ${
                selectedCategory === cat.id
                  ? 'border-l-4 border-primary-500 bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <span className="shrink-0">{cat.icon}</span>
              <span className="min-w-0 truncate">{cat.name}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm sm:p-4">
        <h2 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Communities</h2>
        <div className="flex flex-col gap-2">
          {COMMUNITIES.map((comm) => (
            <button
              key={comm.id}
              type="button"
              onClick={() => {
                handleCommunityClick(comm)
                setSidebarOpen(false)
              }}
              className="flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-neutral-50 md:gap-3"
            >
              <span className="shrink-0 text-base md:text-lg">{comm.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-neutral-900">{comm.name}</div>
                <div className="line-clamp-2 text-xs text-neutral-500">{comm.description}</div>
              </div>
              {me && !me.joinedCommunity && (
                <span className="shrink-0 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                  Join
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      {/* Sidebar: Categories + Communities (tablet/desktop) */}
      <aside className="sticky top-24 hidden h-[calc(100vh-120px)] min-w-0 shrink-0 flex-col gap-4 overflow-y-auto md:flex md:w-52 lg:w-64">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar toggle: Communities + full filters drawer */}
      <div className="fixed bottom-6 left-4 z-40 md:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition hover:bg-primary-700 active:scale-95"
          aria-label="Open communities and filters"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-full w-[min(20rem,85vw)] flex-col gap-4 overflow-y-auto border-r border-neutral-200 bg-white p-4 pt-20 shadow-xl transition-transform duration-200 ease-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-700">Categories & Communities</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-6 pb-20 md:pb-0">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Community Feed</h1>
              <p className="mt-1 text-neutral-600">Ask questions, share knowledge, and grow your reputation</p>
            </div>
            <Link
              to="/ask"
              className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              + Ask Question
            </Link>
          </div>
        </div>

        {/* Mobile: horizontal category pills (responsive, no drawer needed for categories) */}
        <div className="md:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id || 'all'}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search: heading + hashtags */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by heading or #hashtags (e.g. react #javascript #node)"
                className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              />
              <svg className="absolute left-3 top-3.5 h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => setShowUnanswered(!showUnanswered)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all sm:shrink-0 ${
                showUnanswered
                  ? 'bg-error-500 text-white shadow-md'
                  : 'border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Unanswered only
            </button>
          </div>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-neutral-600">Filtering by tags:</span>
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => setQ(q.replace(new RegExp(`#${tag}\\s*`, 'gi'), '').replace(/\s+/g, ' ').trim())}
                    className="ml-1.5 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Community Join Banner */}
        {me && !me.joinedCommunity && !showJoinModal && (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-primary-700">Join the Community</div>
                <div className="mt-1 text-xs text-neutral-600">
                  Welcome {me.name}! Confirm your membership to start asking questions and sharing knowledge.
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={joining}
              onClick={joinCommunity}
              className="mt-2 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60 md:mt-0"
            >
              {joining ? 'Joining…' : 'Join Community'}
            </button>
          </div>
        )}

        {/* Join Community Modal (when clicking a community in sidebar) */}
        {showJoinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowJoinModal(null)}>
            <div
              className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl">
                  💬
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900">Join {showJoinModal.communityName}</h3>
                  <p className="text-sm text-neutral-600">You need to join the community to participate and ask questions.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(null)}
                  className="flex-1 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={joining}
                  onClick={joinCommunity}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-60"
                >
                  {joining ? 'Joining…' : 'Join Community'}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Questions Feed */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="text-neutral-600">Loading questions...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
            <svg className="h-8 w-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-neutral-900">No questions found</h3>
          <p className="mb-4 text-neutral-600">
            {q || hashtags.length > 0
              ? 'Try a different search or hashtags'
              : 'Be the first to ask a question in this community!'}
          </p>
          <Link
            to="/ask"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:shadow-lg"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ask Your First Question
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="px-2 text-sm text-neutral-600">{items.length} questions</p>
          {items.map((x) => (
            <Link
              key={x.id}
              to={`/q/${x.id}`}
              className="group block rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2 pt-1">
                  <div className="flex flex-col items-center text-neutral-500">
                    <svg className="h-5 w-5 transition-colors group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    <span className="text-sm font-semibold text-neutral-900">{x.likesCount || 0}</span>
                    <svg className="h-5 w-5 transition-colors group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-neutral-900">{x.answersCount}</div>
                    <div className="text-xs text-neutral-500">answers</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 flex-1 text-lg font-semibold text-neutral-900 transition-colors group-hover:text-primary-600">
                      {x.title}
                    </h3>
                    {x.hasAcceptedAnswer && (
                      <span className="inline-flex shrink-0 items-center rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-800">
                        <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Accepted
                      </span>
                    )}
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-neutral-600">{x.descriptionPreview}</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {x.tags.map((t) => (
                      <span key={t} className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-800">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-3">
                      <span>
                        {x.author ? (
                          <span className="font-medium text-neutral-700">{x.author.name}</span>
                        ) : (
                          'Anonymous'
                        )}
                        {x.author && <span className="ml-1">· Year {x.author.year}</span>}
                      </span>
                      <span>·</span>
                      <span>{new Date(x.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{x.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}

