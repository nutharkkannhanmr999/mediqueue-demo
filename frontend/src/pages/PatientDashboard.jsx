import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { tokenAPI, queueAPI } from '../api/client'
import { Ticket, Clock, Users, TrendingUp, ChevronRight, Activity } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }
  return (
    <div className="glass-card p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-white font-mono">{value}</p>
      <p className="text-sm font-medium text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [tokens, setTokens] = useState([])
  const [queueStatus, setQueueStatus] = useState(null)
  const [activeTokenStatus, setActiveTokenStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tokensRes, queueRes] = await Promise.all([tokenAPI.myTokens(), queueAPI.status()])
        setTokens(tokensRes.data)
        setQueueStatus(queueRes.data)

        const active = tokensRes.data.find(t => t.status === 'waiting' || t.status === 'called')
        if (active) {
          const statusRes = await tokenAPI.status(active.token_number)
          setActiveTokenStatus(statusRes.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const activeToken = tokens.find(t => t.status === 'waiting' || t.status === 'called')
  const completedCount = tokens.filter(t => t.status === 'completed').length

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading your dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-white">
          Good day, <span className="text-teal-400">{user?.name?.split(' ')[0]}</span>
        </h1>
        <p className="text-slate-400 mt-1">Here's your queue status at a glance.</p>
      </div>

      {/* Active Token Banner */}
      {activeToken && (
        <div className={`rounded-2xl p-6 border animate-bounce-in ${
          activeToken.status === 'called'
            ? 'bg-teal-500/10 border-teal-500/40'
            : 'bg-slate-800/60 border-slate-700/50'
        }`}>
          {activeToken.status === 'called' ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <span className="text-2xl font-bold font-mono text-slate-950">#{activeToken.token_number}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-teal-400 uppercase tracking-widest bg-teal-500/20 px-2 py-0.5 rounded-full">
                    🔔 Your Turn!
                  </span>
                </div>
                <p className="text-white font-semibold text-lg">Please proceed to the doctor's room</p>
                <p className="text-teal-300/70 text-sm">Token #{activeToken.token_number} has been called</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold font-mono text-white">#{activeToken.token_number}</span>
              </div>
              <div className="flex-1">
                <p className="text-slate-300 text-sm mb-1 uppercase tracking-wider font-medium">Active Token</p>
                <p className="text-white font-semibold text-lg mb-3">You're in the queue</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                    <p className="text-teal-400 text-xl font-bold font-mono">
                      {activeTokenStatus?.position ?? '—'}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">Position</p>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                    <p className="text-amber-400 text-xl font-bold font-mono">
                      {queueStatus?.current_token || '—'}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">Now Serving</p>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
                    <p className="text-blue-400 text-xl font-bold font-mono">
                      ~{activeTokenStatus?.estimated_wait_minutes ?? 0}m
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5">Est. Wait</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No active token CTA */}
      {!activeToken && (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-7 h-7 text-teal-400" />
          </div>
          <h2 className="font-display text-xl text-white mb-2">No active token</h2>
          <p className="text-slate-400 text-sm mb-5">Book a token to join the queue and see a doctor today.</p>
          <Link to="/patient/book" className="btn-primary inline-flex items-center gap-2">
            Book a Token <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Ticket} label="My Tokens" value={tokens.length} color="teal" />
        <StatCard icon={Activity} label="Completed" value={completedCount} color="emerald" />
        <StatCard icon={Users} label="In Queue" value={queueStatus?.waiting_count ?? 0} sub="right now" color="blue" />
        <StatCard icon={Clock} label="Queue" value={queueStatus?.queue_status === 'active' ? 'Open' : 'Paused'} color={queueStatus?.queue_status === 'active' ? 'emerald' : 'amber'} />
      </div>

      {/* Recent tokens */}
      {tokens.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-white">Recent Tokens</h2>
            <Link to="/patient/my-tokens" className="text-sm text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {tokens.slice(0, 3).map(t => (
              <div key={t.id} className="glass-card p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-mono flex-shrink-0 ${
                  t.status === 'called' ? 'bg-teal-500 text-slate-950' :
                  t.status === 'completed' ? 'bg-slate-700 text-slate-400' :
                  t.status === 'waiting' ? 'bg-amber-500/20 text-amber-300' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  #{t.token_number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white capitalize">{t.status}</p>
                  <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize border ${
                  t.status === 'waiting' ? 'status-waiting' :
                  t.status === 'called' ? 'bg-teal-500/20 text-teal-300 border-teal-500/30' :
                  t.status === 'completed' ? 'status-completed' : 'status-skipped'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
