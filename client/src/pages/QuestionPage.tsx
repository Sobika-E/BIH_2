import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { api } from '../app/api/http'
import { useAuth } from '../app/auth/AuthContext'
import { FormField } from '../components/FormField'

const categories = [
  { id: 'subjects', name: 'Subjects', icon: '📚' },
  { id: 'placements', name: 'Placements', icon: '💼' },
  { id: 'exams', name: 'Exams', icon: '📝' },
  { id: 'labs', name: 'Labs', icon: '🔬' },
  { id: 'projects', name: 'Projects', icon: '🚀' },
  { id: 'nss', name: 'NSS / Activities', icon: '🎯' },
]

type Answer = {
  id: string
  body: string
  isAccepted: boolean
  likesCount: number
  rating?: number
  averageRating?: number
  createdAt: string
  author: { id: string; name: string; year: number; reputationScore: number } | null
}

type Question = {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  createdAt: string
  answersCount: number
  hasAcceptedAnswer: boolean
  likesCount: number
  author: { id: string; name: string; year: number } | null
}

const answerSchema = z.object({ body: z.string().trim().min(10, 'Answer is too short').max(20000) })
type AnswerValues = z.infer<typeof answerSchema>

export function QuestionPage() {
  const { id } = useParams()
  const { state } = useAuth()
  const me = state.status === 'authenticated' ? state.user : null

  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])

  const canAccept = useMemo(() => {
    return Boolean(me && question?.author?.id === me.id)
  }, [me, question])

  const fetchData = async () => {
    if (!id) return
    setLoading(true)
    const res = await api.get<{ question: Question; answers: Answer[] }>(`/api/questions/${id}`)
    setQuestion(res.data.question)
    setAnswers(res.data.answers)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<AnswerValues>({ resolver: zodResolver(answerSchema) })

  const submitAnswer = handleSubmit(async (values) => {
    try {
      if (!id) return
      await api.post(`/api/questions/${id}/answers`, values)
      reset({ body: '' })
      await fetchData()
    } catch (e: any) {
      setError('root', { message: e?.response?.data?.message ?? 'Failed to post answer' })
    }
  })

  const accept = async (answerId: string) => {
    if (!id) return
    await api.post(`/api/questions/${id}/answers/${answerId}/accept`)
    await fetchData()
  }

  const like = async (answerId: string) => {
    if (!id) return
    await api.post(`/api/questions/${id}/answers/${answerId}/like`)
    await fetchData()
  }

  const rateAnswer = async (answerId: string, rating: number) => {
    if (!id) return
    try {
      await api.post(`/api/questions/${id}/answers/${answerId}/rate`, { rating })
      await fetchData()
    } catch (error) {
      console.error('Failed to rate answer:', error)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p className="text-neutral-600">Loading question...</p>
    </div>
  )
  
  if (!question) return (
    <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 bg-error-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-error-800 mb-2">Question not found</h3>
      <p className="text-error-600">The question you're looking for doesn't exist or has been removed.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="text-lg font-semibold tracking-tight">{question.title}</div>
        <div className="mt-1 text-xs text-neutral-500">
          {question.author ? `${question.author.name} · Year ${question.author.year}` : 'Unknown'} ·{' '}
          {new Date(question.createdAt).toLocaleString()} · {question.category}
        </div>
        <div className="mt-4 whitespace-pre-wrap text-sm text-neutral-800">{question.description}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {question.tags.map((t) => (
            <span key={t} className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-neutral-900">Answers ({answers.length})</div>
        <div className="space-y-3">
          {answers.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border p-4 ${
                a.isAccepted ? 'border-emerald-200 bg-emerald-50/40' : 'border-neutral-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="text-xs text-neutral-500">
                    {a.author ? `${a.author.name} · Year ${a.author.year} · Rep ${a.author.reputationScore}` : 'Unknown'} ·{' '}
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-neutral-800">{a.body}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {a.isAccepted && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Accepted
                    </span>
                  )}
                  <button
                    onClick={() => like(a.id)}
                    className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-1"
                  >
                    ❤️ {a.likesCount}
                  </button>
                  
                  {/* Rating Component */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`text-xl ${star <= (a.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => rateAnswer(a.id, star)}
                        disabled={!me || me.id === a.author?.id}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs text-neutral-500 ml-1">
                      {(a.averageRating || 0).toFixed(1)}
                    </span>
                  </div>
                  {canAccept && !a.isAccepted && (
                    <button
                      onClick={() => accept(a.id)}
                      className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Answer Section */}
      <div className="rounded-2xl bg-white border border-neutral-200 shadow-sm">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Your Answer</h2>
        </div>
        
        <div className="p-6">
          <form className="space-y-4" onSubmit={submitAnswer}>
            <FormField label="Write your answer" error={errors.body?.message}>
              <textarea 
                rows={6} 
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" 
                placeholder="Share your knowledge and help the community..."
                {...register('body')} 
              />
            </FormField>
            
            {errors.root?.message && (
              <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 flex items-center gap-2">
                <svg className="w-5 h-5 text-error-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.root.message}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
              <div className="text-sm text-neutral-600">
                <span className="font-medium">Remember:</span> Be respectful and provide helpful, well-explained answers
              </div>
              <button
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Post Answer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}



