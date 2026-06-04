import { useState, useEffect, useCallback } from 'react'
import { adminAPI, doctorAPI } from '../api/client'
import toast from 'react-hot-toast'
import { Play, Pause, SkipForward, Ticket, Filter } from 'lucide-react'

const STATUS_COLORS = {
  waiting: 'text-amber-300 bg-amber-500/20 border-amber-500/30',
  called: 'text-teal-300 bg-teal-500/20 border-teal-500/30',
  completed: 'text-slate-400 bg-slate-700/40 border-slate-600/30',
  skipped: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default function AdminQueue() {
  const [tokens, setTokens] = useState([])
  const [queueState, setQueueState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [tokensRes, queueRes] = await Promise.all([adminAPI.tokens(), doctorAPI.getQueue()])
      setTokens(tokensRes.data)
      setQueueState(queueRes.data.state)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const act = async (fn, key, msg) => {
    setActionLoading(key)
    try {
      await fn()
      toast.success(msg)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed')
    } finally {
      setActionLoading('')
    }
  }

  const filteredTokens = filter === 'all' ? tokens : tokens.filter(t => t.status === filter)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Queue Control</h1>
          <p className="text-slate-400 text-sm mt-1">All tokens · {tokens.length} total</p>
        </div>
        <div className="flex gap-2">
          {queueState?.status === 'paused' ? (
            <button onClick={() => act(doctorAPI.resume, 'resume', 'Queue resumed')} disabled={actionLoading === 'resume'} className="btn-success flex items-center gap-2">
              <Play className="w-4 h-4" /> Resume
            </button>
          ) : (
            <button onClick={() => act(doctorAPI.pause, 'pause', 'Queue paused')} disabled={actionLoading === 'pause'} className="btn-warning flex items-center gap-2">
              <Pause className="w-4 h-4" /> Pause
            </button>
          )}
          <button onClick={() => act(doctorAPI.callNext, 'next', 'Next patient called!')} disabled={actionLoading === 'next'} className="btn-primary flex items-center gap-2">
            Call Next
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'waiting', 'called', 'completed', 'skipped'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'bg-slate-800/60 text-slate-400 hover:text-slate-300 border border-slate-700/40'
            }`}
          >
            <Filter className="w-3 h-3 inline mr-1" />
            {f} {f === 'all' ? `(${tokens.length})` : `(${tokens.filter(t => t.status === f).length})`}
          </button>
        ))}
      </div>

      {filteredTokens.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Ticket className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No tokens in this category</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Token</th>
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Patient</th>
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Status</th>
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Notes</th>
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Time</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {filteredTokens.map((t, i) => (
                  <tr key={t.id} className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${i === filteredTokens.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white text-lg">#{t.token_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-200">{t.patient_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium capitalize ${STATUS_COLORS[t.status]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 max-w-[150px] truncate">{t.notes || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500">{new Date(t.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      {t.status === 'waiting' && (
                        <button
                          onClick={() => act(() => doctorAPI.skip(t.token_number), `skip-${t.token_number}`, `Token #${t.token_number} skipped`)}
                          disabled={actionLoading === `skip-${t.token_number}`}
                          className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <SkipForward className="w-3.5 h-3.5" /> Skip
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-slate-700/40">
            {filteredTokens.map(t => (
              <div key={t.id} className="p-4 flex items-center gap-4">
                <span className="font-mono font-bold text-white text-xl w-12 text-center flex-shrink-0">#{t.token_number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{t.patient_name}</p>
                  {t.notes && <p className="text-xs text-slate-500 truncate">{t.notes}</p>}
                  <p className="text-xs text-slate-600 mt-0.5">{new Date(t.created_at).toLocaleTimeString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium capitalize flex-shrink-0 ${STATUS_COLORS[t.status]}`}>
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
