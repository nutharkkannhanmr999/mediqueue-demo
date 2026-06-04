import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokenAPI, queueAPI } from '../api/client'
import toast from 'react-hot-toast'
import { Ticket, Clock, Users, CheckCircle, FileText } from 'lucide-react'

export default function BookToken() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [queueStatus, setQueueStatus] = useState(null)
  const [booked, setBooked] = useState(null)

  useEffect(() => {
    queueAPI.status().then(r => setQueueStatus(r.data)).catch(console.error)
  }, [])

  const handleBook = async () => {
    setLoading(true)
    try {
      const res = await tokenAPI.book(notes || null)
      setBooked(res.data)
      toast.success('Token booked successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to book token')
    } finally {
      setLoading(false)
    }
  }

  if (booked) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 animate-bounce-in">
        <div className="glass-card p-8 text-center">
          <div className="w-20 h-20 bg-teal-500/20 border-2 border-teal-500/50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-teal-400" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">Token Booked!</h1>
          <p className="text-slate-400 text-sm mb-8">You're in the queue. We'll call you when it's your turn.</p>

          {/* Token number */}
          <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-6 mb-6">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Your Token Number</p>
            <p className="text-6xl font-bold font-mono text-teal-400">#{booked.token_number}</p>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="bg-slate-800/60 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <p className="text-sm font-medium text-amber-300 capitalize">{booked.status}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Now Serving</p>
              <p className="text-sm font-medium text-white font-mono">
                #{queueStatus?.current_token || 0}
              </p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">In Queue</p>
              <p className="text-sm font-medium text-white">{queueStatus?.waiting_count ?? '—'} people</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">Booked At</p>
              <p className="text-sm font-medium text-white">{new Date(booked.created_at).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/patient')} className="btn-secondary flex-1">
              Dashboard
            </button>
            <button onClick={() => navigate('/patient/my-tokens')} className="btn-primary flex-1">
              Track Token
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white mb-2">Book a Token</h1>
        <p className="text-slate-400">Reserve your spot in today's queue</p>
      </div>

      {/* Queue status */}
      {queueStatus && (
        <div className={`rounded-xl p-4 mb-6 border flex items-center gap-3 ${
          queueStatus.queue_status === 'active'
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            queueStatus.queue_status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${queueStatus.queue_status === 'active' ? 'text-emerald-300' : 'text-amber-300'}`}>
              Queue is {queueStatus.queue_status === 'active' ? 'Active & Accepting' : 'Currently Paused'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {queueStatus.waiting_count} people waiting · Now serving #{queueStatus.current_token}
            </p>
          </div>
        </div>
      )}

      <div className="glass-card p-6 space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <FileText className="w-4 h-4 text-slate-500" />
            Reason for visit (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="E.g. Fever, regular checkup, follow-up…"
            rows={3}
            className="input-field resize-none"
          />
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-900/60 rounded-xl p-3 text-center">
            <Ticket className="w-5 h-5 text-teal-400 mx-auto mb-1.5" />
            <p className="text-white font-bold font-mono text-sm">#{queueStatus?.next_token_number ?? '—'}</p>
            <p className="text-slate-500 text-xs">Your Token</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center">
            <Users className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
            <p className="text-white font-bold font-mono text-sm">{queueStatus?.waiting_count ?? 0}</p>
            <p className="text-slate-500 text-xs">Ahead of you</p>
          </div>
          <div className="bg-slate-900/60 rounded-xl p-3 text-center">
            <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1.5" />
            <p className="text-white font-bold font-mono text-sm">~{(queueStatus?.waiting_count ?? 0) * 5}m</p>
            <p className="text-slate-500 text-xs">Est. Wait</p>
          </div>
        </div>

        <button onClick={handleBook} disabled={loading || queueStatus?.queue_status === 'paused'} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Booking…
            </span>
          ) : queueStatus?.queue_status === 'paused'
            ? '⏸ Queue Paused — Try Later'
            : '✦ Book My Token'}
        </button>
      </div>
    </div>
  )
}
