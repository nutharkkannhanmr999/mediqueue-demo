import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { tokenAPI, queueAPI } from '../api/client'
import { Ticket, RefreshCw, Clock } from 'lucide-react'

const STATUS_CONFIG = {
  waiting: { label: 'Waiting', cls: 'status-waiting', dot: 'bg-amber-400 animate-pulse' },
  called: { label: 'Called!', cls: 'bg-teal-500/20 text-teal-300 border border-teal-500/30', dot: 'bg-teal-400 animate-pulse' },
  completed: { label: 'Completed', cls: 'status-completed', dot: 'bg-slate-500' },
  skipped: { label: 'Skipped', cls: 'status-skipped', dot: 'bg-red-400' },
}

export default function MyTokens() {
  const [tokens, setTokens] = useState([])
  const [queueStatus, setQueueStatus] = useState(null)
  const [tokenDetails, setTokenDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const [tokensRes, queueRes] = await Promise.all([tokenAPI.myTokens(), queueAPI.status()])
      setTokens(tokensRes.data)
      setQueueStatus(queueRes.data)

      // Fetch position details for active tokens
      const activeTokens = tokensRes.data.filter(t => t.status === 'waiting' || t.status === 'called')
      const details = {}
      await Promise.all(activeTokens.map(async (t) => {
        try {
          const res = await tokenAPI.status(t.token_number)
          details[t.token_number] = res.data
        } catch {}
      }))
      setTokenDetails(details)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">My Tokens</h1>
          <p className="text-slate-400 text-sm mt-1">Track your queue position in real time</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors glass-card px-4 py-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Queue status bar */}
      {queueStatus && (
        <div className="glass-card p-4 mb-6 flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${queueStatus.queue_status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <div className="flex-1">
            <p className="text-sm text-slate-300">Queue is <span className={`font-medium ${queueStatus.queue_status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>{queueStatus.queue_status}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Now serving</p>
            <p className="text-xl font-bold font-mono text-white">#{queueStatus.current_token}</p>
          </div>
        </div>
      )}

      {/* Tokens list */}
      {tokens.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Ticket className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">You haven't booked any tokens yet.</p>
          <Link to="/patient/book" className="btn-primary inline-block">Book Your First Token</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map(t => {
            const cfg = STATUS_CONFIG[t.status]
            const detail = tokenDetails[t.token_number]
            return (
              <div key={t.id} className={`glass-card p-5 transition-all duration-300 ${t.status === 'called' ? 'border-teal-500/40 shadow-lg shadow-teal-500/10' : ''}`}>
                <div className="flex items-start gap-4">
                  {/* Token number */}
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 font-bold font-mono text-lg ${
                    t.status === 'called' ? 'bg-teal-500 text-slate-950' :
                    t.status === 'waiting' ? 'bg-amber-500/20 text-amber-300' :
                    t.status === 'completed' ? 'bg-slate-700 text-slate-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    #{t.token_number}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.cls}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>

                    {/* Active token details */}
                    {detail && (t.status === 'waiting' || t.status === 'called') && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                          <p className="text-teal-400 font-bold font-mono">{detail.position || 0}</p>
                          <p className="text-slate-500 text-xs">Position</p>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                          <p className="text-amber-400 font-bold font-mono">#{detail.current_token}</p>
                          <p className="text-slate-500 text-xs">Serving</p>
                        </div>
                        <div className="bg-slate-900/60 rounded-lg p-2 text-center">
                          <p className="text-blue-400 font-bold font-mono">~{detail.estimated_wait_minutes}m</p>
                          <p className="text-slate-500 text-xs">Wait</p>
                        </div>
                      </div>
                    )}

                    {t.status === 'called' && (
                      <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg px-3 py-2 text-sm text-teal-300 font-medium">
                        🔔 Please proceed to the consultation room now!
                      </div>
                    )}

                    {t.notes && (
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.notes}
                      </p>
                    )}

                    <p className="text-xs text-slate-600 mt-1.5">
                      Booked {new Date(t.created_at).toLocaleString()}
                      {t.completed_at && ` · Completed ${new Date(t.completed_at).toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
