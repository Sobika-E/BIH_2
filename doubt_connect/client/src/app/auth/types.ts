export type User = {
  id: string
  name: string
  department: string
  year: 1 | 2 | 3 | 4
  rollNumber: string
  email: string
  mobileNumber: string
  skills: string[]
  experience: string
  githubUrl?: string
  linkedinUrl?: string
  joinedCommunity?: boolean
  reputationScore: number
  contributionCount: number
  acceptedAnswersCount: number
}

