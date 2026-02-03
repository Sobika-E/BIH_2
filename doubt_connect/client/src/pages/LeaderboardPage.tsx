import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../app/api/http'
import { useAuth } from '../app/auth/AuthContext'

type LeaderboardUser = {
  id: string
  name: string
  department: string
  year: number
  skills: string[]
  experience: string
  reputationScore: number
  contributionCount: number
  acceptedAnswersCount: number
  totalRatingsReceived: number
  averageRating: number
}

export function LeaderboardPage() {
  const { state } = useAuth()
  const me = state.status === 'authenticated' ? state.user : null
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await api.get<{ users: LeaderboardUser[] }>('/api/contributors/leaderboard')
        setLeaderboardUsers(response.data.users)
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        <p className="text-neutral-600">Loading leaderboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-neutral-900">Top Contributors</h1>
            <p className="text-neutral-600">Ranked by reputation, contributions, and quality ratings</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="pb-3 text-left text-sm font-semibold text-neutral-700">Rank</th>
                <th className="pb-3 text-left text-sm font-semibold text-neutral-700">User</th>
                <th className="pb-3 text-left text-sm font-semibold text-neutral-700">Department</th>
                <th className="pb-3 text-left text-sm font-semibold text-neutral-700">Year</th>
                <th className="pb-3 text-left text-sm font-semibold text-neutral-700">Reputation</th>
                <th className="pb-3 text-left text-sm font-semibold text-neutral-700">Contributions</th>
                <th className="pb-3 text-left text-sm font-semibold text-neutral-700">Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardUsers.map((user, index) => (
                <tr key={user.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${index < 3 ? 'text-warning-500' : 'text-neutral-500'}`}>
                        {index + 1}
                      </span>
                      {index === 0 && (
                        <span className="text-2xl">🥇</span>
                      )}
                      {index === 1 && (
                        <span className="text-2xl">🥈</span>
                      )}
                      {index === 2 && (
                        <span className="text-2xl">🥉</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900">{user.name}</div>
                        <Link
                          to={`/profile/${user.id}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-neutral-700">{user.department}</td>
                  <td className="py-4 text-neutral-700">{user.year}</td>
                  <td className="py-4">
                    <span className="font-semibold text-neutral-900">{user.reputationScore}</span>
                  </td>
                  <td className="py-4">
                    <span className="font-semibold text-neutral-900">{user.contributionCount}</span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-neutral-900">{(user.averageRating || 0).toFixed(1)}</span>
                      <span className="text-warning-500">★</span>
                    </div>
                    <div className="text-xs text-neutral-500">{user.totalRatingsReceived || 0} ratings</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}