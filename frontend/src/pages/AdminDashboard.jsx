import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../api/client'
import toast from 'react-hot-toast'
import { Users, Ticket, Activity, AlertTriangle, TrendingUp, ChevronRight, RefreshCw } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="glass-card p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold font-mono text-white">{value}</p>
      <p className="text-sm text-slate-300 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const fetchStats = async () => {
    try {
      const res = await adminAPI.stats()
      setStats(res.data)
    } catch (err) {
      toast.error('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleReset = async () => {
    setResetting(true)
    try {
      await adminAPI.resetQueue()
      toast.success('Queue reset successfully!')
      setShowConfirm(false)
      await fetchStats()
    } catch (err) {
      toast.error('Reset failed')
    } finally {
      setResetting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const completionRate = stats?.total_tokens > 0
    ? Math.round((stats.completed / stats.total_tokens) * 100)
    : 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Admin Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Hospital queue system at a glance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchStats} className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 glass-card px-4 py-2 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button onClick={() => setShowConfirm(true)} className="btn-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Reset Queue
          </button>
        </div>
      </div>

      {/* Confirm reset modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-sm w-full text-center animate-bounce-in">
            <div className="w-14 h-14 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="font-display text-xl text-white mb-2">Reset Queue?</h3>
            <p className="text-slate-400 text-sm mb-6">This will delete all tokens and reset the counter to 1. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleReset} disabled={resetting} className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold px-4 py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50">
                {resetting ? 'Resetting…' : 'Yes, Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Status */}
      <div className={`rounded-2xl p-5 border mb-8 flex items-center gap-5 ${
        stats?.queue_status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
      }`}>
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${stats?.queue_status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <div className="flex-1">
          <p className={`font-medium ${stats?.queue_status === 'active' ? 'text-emerald-300' : 'text-amber-300'}`}>
            Queue is {stats?.queue_status === 'active' ? 'Active' : 'Paused'}
          </p>
          <p className="text-slate-400 text-sm">Now serving token #{stats?.current_token || 0}</p>
        </div>
        <Link to="/admin/queue" className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors">
          Manage <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Patients" value={stats?.total_patients ?? 0} accent="bg-blue-500/15 text-blue-400" />
        <StatCard icon={Ticket} label="Total Tokens" value={stats?.total_tokens ?? 0} accent="bg-teal-500/15 text-teal-400" />
        <StatCard icon={Activity} label="Waiting" value={stats?.waiting ?? 0} sub="right now" accent="bg-amber-500/15 text-amber-400" />
        <StatCard icon={TrendingUp} label="Completed" value={stats?.completed ?? 0} sub={`${completionRate}% rate`} accent="bg-emerald-500/15 text-emerald-400" />
      </div>

      {/* Details row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-bold font-mono text-teal-400">{stats?.called ?? 0}</p>
          <p className="text-sm text-slate-400 mt-1">Currently Called</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-bold font-mono text-red-400">{stats?.skipped ?? 0}</p>
          <p className="text-sm text-slate-400 mt-1">Skipped</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-2xl font-bold font-mono text-purple-400">{completionRate}%</p>
          <p className="text-sm text-slate-400 mt-1">Completion Rate</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/admin/patients" className="glass-card p-5 flex items-center gap-4 hover:border-teal-500/30 transition-all group">
          <div className="w-12 h-12 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-500/20 transition-colors">
            <Users className="w-5 h-5 text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Patient Records</p>
            <p className="text-sm text-slate-400">{stats?.total_patients} registered patients</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
        </Link>

        <Link to="/admin/queue" className="glass-card p-5 flex items-center gap-4 hover:border-teal-500/30 transition-all group">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500/20 transition-colors">
            <Ticket className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">Queue Control</p>
            <p className="text-sm text-slate-400">Manage tokens and queue state</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
