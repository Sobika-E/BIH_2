import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { api } from '../app/api/http'
import { FormField } from '../components/FormField'

const categories = [
  { id: 'subjects', name: 'Subjects', icon: '📚', description: 'Academic subjects and coursework' },
  { id: 'placements', name: 'Placements', icon: '💼', description: 'Job placements and career guidance' },
  { id: 'exams', name: 'Exams', icon: '📝', description: 'Exam preparation and study tips' },
  { id: 'labs', name: 'Labs', icon: '🔬', description: 'Lab work and practical sessions' },
  { id: 'projects', name: 'Projects', icon: '🚀', description: 'Academic and personal projects' },
  { id: 'nss', name: 'NSS / Activities', icon: '🎯', description: 'Campus activities and NSS programs' },
]

const schema = z.object({
  title: z.string().trim().min(10, 'Title is too short').max(160),
  description: z.string().trim().min(30, 'Add more detail').max(20000),
  category: z.enum(['Subjects', 'Placements', 'Exams', 'Labs', 'Projects', 'NSS / Activities']),
  tags: z.string().optional(),
})

// Extract hashtags from text
const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#[\w]+/g)
  return matches ? matches.map(tag => tag.substring(1)) : []
}

type Values = z.infer<typeof schema>

export function AskPage() {
  const nav = useNavigate()
  const [detectedTags, setDetectedTags] = useState<string[]>([])
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'Subjects' },
  })
  
  const descriptionValue = watch('description')
  
  // Extract hashtags from description in real-time
  useEffect(() => {
    if (descriptionValue) {
      const tags = extractHashtags(descriptionValue)
      setDetectedTags(tags)
    }
  }, [descriptionValue])

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Combine manual tags and detected hashtags
      const manualTags = (values.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      
      const descriptionTags = extractHashtags(values.description)
      const allTags = [...new Set([...manualTags, ...descriptionTags])]
      
      const res = await api.post<{ id: string }>('/api/questions', {
        title: values.title,
        description: values.description,
        category: values.category,
        tags: allTags,
      })
      nav(`/q/${res.data.id}`)
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Failed to post question'
      setError('root', { message: msg })
    }
  })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-neutral-900">Ask a Question</h1>
        <p className="text-neutral-600">Share your knowledge and get help from the community. Be specific and include relevant details.</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <form className="space-y-6" onSubmit={onSubmit}>
          <FormField label="Question Title" error={errors.title?.message}>
            <input
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., How to implement JWT authentication in MERN stack?"
              {...register('title')}
            />
          </FormField>

          <div>
            <label className="mb-3 block text-sm font-medium text-neutral-700">Category</label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex cursor-pointer items-start rounded-xl border border-neutral-200 p-4 transition-colors hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
                >
                  <input
                    type="radio"
                    value={cat.name}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500"
                    {...register('category')}
                  />
                  <div className="ml-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-medium text-neutral-900">{cat.name}</span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">{cat.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.category?.message && (
              <p className="mt-2 text-sm text-error-600">{errors.category.message}</p>
            )}
          </div>

          <FormField label="Detailed Description" error={errors.description?.message}>
            <textarea
              rows={8}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              placeholder="Explain your question in detail. You can use #hashtags to tag relevant topics..."
              {...register('description')}
            />
            <div className="mt-2 text-xs text-neutral-500">
              Tip: Include relevant #hashtags in your description for better discoverability
            </div>
          </FormField>

          {detectedTags.length > 0 && (
            <div className="rounded-xl border border-primary-200 bg-primary-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="text-sm font-medium text-primary-800">Detected Hashtags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <FormField label="Additional Tags (comma separated)" error={errors.tags?.message}>
            <input
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., mongodb, react, nodejs, javascript"
              {...register('tags')}
            />
            <div className="mt-2 text-xs text-neutral-500">
              These will be combined with any hashtags detected in your description
            </div>
          </FormField>

          {errors.root?.message && (
            <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.root.message}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Pro tip:</span> Questions with clear titles and relevant tags get 40% more responses!
            </div>
            <button
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
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
                  Post Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

