import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { z } from 'zod'
import { api } from '../app/api/http'
import { useAuth } from '../app/auth/AuthContext'
import { FormField } from '../components/FormField'

const schema = z.object({
  skillsInput: z.string().optional(),
  experience: z.string().max(2000, 'Keep it under 2000 characters'),
  githubUrl: z.string().url('Enter a valid URL').max(200).or(z.literal('')).optional(),
  linkedinUrl: z.string().url('Enter a valid URL').max(200).or(z.literal('')).optional(),
})

type Values = z.infer<typeof schema>

export function ProfilePage() {
  // Get auth state first
  const { state, refreshMe } = useAuth()
  const me = state.status === 'authenticated' ? state.user : null
  
  // Then get route params
  const { userId } = useParams<{ userId?: string }>()
  
  // Initialize state
  const [isEditing, setIsEditing] = useState(false)
  const [viewedUser, setViewedUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const isOwnProfile = !userId || userId === me?.id
  const userToShow = isOwnProfile ? me : viewedUser

  // Fetch user data when viewing another user's profile
  useEffect(() => {
    if (!isOwnProfile && userId) {
      const fetchUser = async () => {
        setLoading(true)
        try {
          const response = await api.get(`/api/auth/${userId}`)
          // The API returns the user data directly, not wrapped in a data object
          setViewedUser(response.data)
        } catch (error: any) {
          console.error('Failed to fetch user profile:', error)
          // Handle unauthorized access
          if (error?.response?.status === 401) {
            console.error('Not authorized to view this profile')
          } else if (error?.response?.status === 404) {
            console.error('User not found')
          }
        } finally {
          setLoading(false)
        }
      }
      fetchUser()
    }
  }, [userId, isOwnProfile])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
    watch,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      skillsInput: '',
      experience: '',
      githubUrl: '',
      linkedinUrl: '',
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (me) {
      reset({
        skillsInput: me.skills?.join(', ') ?? '',
        experience: me.experience ?? '',
        githubUrl: me.githubUrl ?? '',
        linkedinUrl: me.linkedinUrl ?? '',
      })
    }
  }, [me, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      const skills =
        values.skillsInput
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean) ?? []

      await api.patch('/api/profile/me', {
        skills,
        experience: values.experience,
        githubUrl: values.githubUrl,
        linkedinUrl: values.linkedinUrl,
      })
      await refreshMe()
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Failed to update profile'
      setError('root', { message: msg })
    }
  })

  const skillsInput = watch('skillsInput')
  const experience = watch('experience')
  const githubUrl = watch('githubUrl')
  const linkedinUrl = watch('linkedinUrl')

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {isOwnProfile ? 'My Profile' : `${userToShow?.name}'s Profile`}
            </h1>
            <p className="text-neutral-600">
              {isOwnProfile 
                ? (isEditing 
                    ? 'Update your skills and experience to appear as a stronger mentor on the Top Contributors page.'
                    : 'View and manage your profile information.')
                : 'View contributor\'s profile information.'}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {userToShow && (
              <div className="bg-white rounded-xl px-4 py-3 text-sm shadow-sm">
                <div className="font-semibold text-neutral-900">{userToShow.name}</div>
                <div>
                  {userToShow.department} · Year {userToShow.year}
                </div>
                <div>Rep {userToShow.reputationScore}</div>
              </div>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        {isEditing ? (
          <form className="space-y-6" onSubmit={onSubmit}>
            <FormField label="Skills (comma separated)" error={errors.skillsInput?.message}>
              <input
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="react, mongodb, data structures"
                {...register('skillsInput')}
              />
            </FormField>

            <FormField label="Experience / About you" error={errors.experience?.message}>
              <textarea
                rows={6}
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Share what you've worked on, subjects you're confident in, or how you like to help others."
                {...register('experience')}
              />
            </FormField>

            <FormField label="GitHub URL" error={errors.githubUrl?.message}>
              <input
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://github.com/username"
                {...register('githubUrl')}
              />
            </FormField>

            <FormField label="LinkedIn URL" error={errors.linkedinUrl?.message}>
              <input
                className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://www.linkedin.com/in/username"
                {...register('linkedinUrl')}
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

            <div className="pt-4">
              <button
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-secondary-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Skills</h3>
              {userToShow?.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {userToShow.skills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 italic">No skills added yet</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">Experience</h3>
              <p className="text-neutral-700 whitespace-pre-wrap">
                {userToShow?.experience || 'No experience information provided'}</p>
            </div>

            {(userToShow?.githubUrl || userToShow?.linkedinUrl) && (
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-3">Links</h3>
                <div className="flex flex-col gap-2">
                  {userToShow.githubUrl && (
                    <a 
                      href={userToShow.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      GitHub Profile
                    </a>
                  )}
                  {userToShow.linkedinUrl && (
                    <a 
                      href={userToShow.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary-600 hover:underline"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {userToShow && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-neutral-900 mb-4">Account Overview</div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4 border border-primary-100">
              <div className="text-primary-600 font-medium mb-1">Reputation</div>
              <div className="text-2xl font-bold text-neutral-900">{userToShow.reputationScore}</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4 border border-primary-100">
              <div className="text-primary-600 font-medium mb-1">Contributions</div>
              <div className="text-2xl font-bold text-neutral-900">{userToShow.contributionCount}</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-success-50 to-accent-50 p-4 border border-success-100">
              <div className="text-success-600 font-medium mb-1">Accepted Answers</div>
              <div className="text-2xl font-bold text-neutral-900">{userToShow.acceptedAnswersCount}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

