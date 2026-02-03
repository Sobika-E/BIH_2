import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './app/auth/ProtectedRoute'
import { Shell } from './components/Shell'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { FeedPage } from './pages/FeedPage'
import { AskPage } from './pages/AskPage'
import { QuestionPage } from './pages/QuestionPage'
import { ContributorsPage } from './pages/ContributorsPage'
import { LandingPage } from './pages/LandingPage'
import { ProfilePage } from './pages/ProfilePage'
import { MessagesPage } from './pages/MessagesPage'
import { MessagesListPage } from './pages/MessagesListPage'
import { AboutPage } from './pages/AboutPage'
import { LeaderboardPage } from './pages/LeaderboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route path="/community" element={<FeedPage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/q/:id" element={<QuestionPage />} />
          <Route path="/contributors" element={<ContributorsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesListPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
