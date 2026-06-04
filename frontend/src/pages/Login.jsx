import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}!`)
      if (user.role === 'patient') navigate('/patient')
      else if (user.role === 'doctor') navigate('/doctor')
      else navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Demo accounts helper
  const fillDemo = (role) => {
    const demos = {
      patient: { email: 'patient@demo.com', password: 'demo1234' },
      doctor: { email: 'doctor@demo.com', password: 'demo1234' },
      admin: { email: 'admin@demo.com', password: 'demo1234' },
    }
    setForm(demos[role])
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-500/20 border border-teal-500/30 rounded-2xl mb-4">
            <Activity className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="font-display text-3xl text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your MediQueue account</p>
        </div>

        {/* Demo shortcuts */}
        <div className="glass-card p-4 mb-6">
          <p className="text-xs text-slate-500 mb-2 text-center uppercase tracking-wider">Quick Demo Login</p>
          <div className="flex gap-2">
            {['patient', 'doctor', 'admin'].map(role => (
              <button key={role} onClick={() => fillDemo(role)}
                className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-slate-700/60 text-slate-300 hover:bg-teal-500/20 hover:text-teal-300 capitalize transition-all">
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass-card p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
