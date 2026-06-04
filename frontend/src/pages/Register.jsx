import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Activity, Mail, Lock, User, Phone, ShieldCheck } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'patient' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const user = await register(form)
      toast.success(`Welcome, ${user.name}!`)
      if (user.role === 'patient') navigate('/patient')
      else if (user.role === 'doctor') navigate('/doctor')
      else navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-500/20 border border-teal-500/30 rounded-2xl mb-4">
            <Activity className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="font-display text-3xl text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm">Join MediQueue to book and track appointments</p>
        </div>

        <div className="glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Account Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'patient', label: 'Patient', icon: '🧑‍🦽' },
                  { value: 'doctor', label: 'Doctor', icon: '👨‍⚕️' },
                  { value: 'admin', label: 'Admin', icon: '🛡️' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                    className={`py-2.5 px-2 rounded-xl text-sm font-medium text-center transition-all border ${
                      form.role === opt.value
                        ? 'bg-teal-500/20 border-teal-500/60 text-teal-300'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{opt.icon}</div>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.name} onChange={set('name')} placeholder="Dr. Jane Smith"
                  required className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"
                  required className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 9876543210"
                  className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters"
                  required className="input-field pl-10" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
