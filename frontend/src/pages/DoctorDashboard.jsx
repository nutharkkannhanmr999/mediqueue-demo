import { useState, useEffect, useCallback } from 'react'
import { doctorAPI } from '../api/client'
import toast from 'react-hot-toast'
import { ChevronRight, Pause, Play, SkipForward, Users, Activity, Clock } from 'lucide-react'

export default function DoctorDashboard() {
  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')

  const fetchQueue = useCallback(async () => {
    try {
      const res = await doctorAPI.getQueue()
      setQueue(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 8000)
    return () => clearInterval(interval)
  }, [fetchQueue])

  const act = async (fn, key, successMsg) => {
    setActionLoading(key)
    try {
      await fn()
      toast.success(successMsg)
      await fetchQueue()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed')
    } finally {
      setActionLoading('')
    }
  }

  const callNext = () => act(doctorAPI.callNext, 'next', 'Next patient called!')
  const pauseQueue = () => act(doctorAPI.pause, 'pause', 'Queue paused')
  const resumeQueue = () => act(doctorAPI.resume, 'resume', 'Queue resumed')
  const skipToken = (num) => act(() => doctorAPI.skip(num), `skip-${num}`, `Token #${num} skipped`)

  const isPaused = queue?.state?.status === 'paused'
  const currentToken = queue?.state?.current_token
  const calledToken = queue?.tokens?.find(t => t.status === 'called')
  const waitingTokens = queue?.tokens?.filter(t => t.status === 'waiting') ?? []

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading queue…</p>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Doctor Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your consultation queue</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
          isPaused ? 'queue-paused' : 'queue-active'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
          Queue {isPaused ? 'Paused' : 'Active'}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-5 text-center">
          <Activity className="w-5 h-5 text-teal-400 mx-auto mb-2" />
          <p className="text-3xl font-bold font-mono text-white">{currentToken || '—'}</p>
          <p className="text-sm text-slate-400 mt-0.5">Now Serving</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-3xl font-bold font-mono text-white">{queue?.waiting_count ?? 0}</p>
          <p className="text-sm text-slate-400 mt-0.5">Waiting</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Clock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
          <p className="text-3xl font-bold font-mono text-white">~{(queue?.waiting_count ?? 0) * 5}m</p>
          <p className="text-sm text-slate-400 mt-0.5">Est. Total Wait</p>
        </div>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={callNext}
          disabled={actionLoading === 'next' || isPaused || waitingTokens.length === 0}
          className="btn-primary flex items-center gap-2 flex-1 sm:flex-none justify-center"
        >
          {actionLoading === 'next' ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          ) : <ChevronRight className="w-4 h-4" />}
          Call Next Patient
        </button>

        {isPaused ? (
          <button onClick={resumeQueue} disabled={actionLoading === 'resume'} className="btn-success flex items-center gap-2">
            <Play className="w-4 h-4" /> Resume Queue
          </button>
        ) : (
          <button onClick={pauseQueue} disabled={actionLoading === 'pause'} className="btn-warning flex items-center gap-2">
            <Pause className="w-4 h-4" /> Pause Queue
          </button>
        )}
      </div>

      {/* Currently Called */}
      {calledToken && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-3">Currently Consulting</h2>
          <div className="rounded-2xl p-5 border bg-teal-500/10 border-teal-500/40 flex items-center gap-5">
            <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold font-mono text-slate-950">#{calledToken.token_number}</span>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-lg">{calledToken.patient_name}</p>
              {calledToken.notes && <p className="text-teal-300/70 text-sm mt-0.5">{calledToken.notes}</p>}
              <p className="text-slate-500 text-xs mt-1">Called at {calledToken.called_at ? new Date(calledToken.called_at).toLocaleTimeString() : '—'}</p>
            </div>
            <span className="text-xs font-medium text-teal-300 bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-full animate-pulse">
              In Progress
            </span>
          </div>
        </div>
      )}

      {/* Waiting Queue */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-3">
          Waiting Queue ({waitingTokens.length})
        </h2>

        {waitingTokens.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No patients waiting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waitingTokens.map((t, i) => (
              <div key={t.id} className="glass-card p-4 flex items-center gap-4 group hover:border-slate-600/50 transition-all">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-slate-600 text-xs font-mono w-6 text-right">{i + 1}</span>
                  <div className="w-11 h-11 bg-slate-700 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold font-mono text-white">#{t.token_number}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{t.patient_name}</p>
                  {t.notes && <p className="text-slate-500 text-xs truncate mt-0.5">{t.notes}</p>}
                  <p className="text-slate-600 text-xs mt-0.5">{new Date(t.created_at).toLocaleTimeString()}</p>
                </div>
                <button
                  onClick={() => skipToken(t.token_number)}
                  disabled={actionLoading === `skip-${t.token_number}`}
                  title="Skip this patient"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 px-3 py-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <SkipForward className="w-3.5 h-3.5" /> Skip
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
