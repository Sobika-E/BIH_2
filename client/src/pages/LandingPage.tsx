import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />
      
      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        <section className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm mb-6 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-700">Student-first community</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 animate-slide-up">
              Get unstuck
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                faster.
              </span>
              Grow your
              <span className="block bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                reputation.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 animate-fade-in delay-100">
              Join a private Q&A community where knowledge sharing leads to real growth. 
              Ask questions, share insights, and build your academic reputation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16 animate-fade-in delay-200">
              <Link
                to="/signup"
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:-translate-y-1 text-center"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-2xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
              >
                I have an account
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0 animate-fade-in delay-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10K+</div>
                <div className="text-sm text-slate-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600">50K+</div>
                <div className="text-sm text-slate-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">98%</div>
                <div className="text-sm text-slate-600">Satisfaction</div>
              </div>
            </div>
          </div>
          
          {/* Right Content - Preview Card */}
          <div className="animate-fade-in delay-300">
            <div className="rounded-3xl bg-white/70 backdrop-blur border border-slate-200 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Recent Questions</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Live feed
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="font-medium text-slate-900 mb-2">
                    How to implement JWT authentication in MERN stack?
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>4 answers · 2 accepted</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Placements</span>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-cyan-200 transition-colors">
                  <div className="font-medium text-slate-900 mb-2">
                    Best resources for DBMS theory before internals?
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>3 answers · 12 likes</span>
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">Exams</span>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-teal-200 transition-colors">
                  <div className="font-medium text-slate-900 mb-2">
                    How to balance NSS activities with academics?
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>2 answers · 8 likes</span>
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full">NSS</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Join to see more questions</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to join the community?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Start asking questions, sharing knowledge, and building your academic reputation today.
          </p>
          <Link
            to="/signup"
            className="inline-block rounded-2xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-1"
          >
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-2xl bg-blue-600 text-white grid place-items-center text-sm font-bold">
                DC
              </div>
              <span className="text-lg font-semibold text-white">DoubtConnect</span>
            </div>
            <p className="mb-6 max-w-md mx-auto">
              A student-first Q&A community for collaborative learning and knowledge sharing.
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-xs text-slate-500">
              © {new Date().getFullYear()} DoubtConnect. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

