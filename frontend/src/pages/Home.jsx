import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, Ticket, Clock, Shield, ChevronRight, Users, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { queueAPI } from '../api/client'

export default function Home() {
  const { user } = useAuth()
  const [queueStatus, setQueueStatus] = useState(null)

  useEffect(() => {
    queueAPI.status().then(r => setQueueStatus(r.data)).catch(() => {})
  }, [])

  const dashboardLink = user
    ? user.role === 'doctor' ? '/doctor' : user.role === 'admin' ? '/admin' : '/patient'
    : null

  return (
    <div className="bg-mesh">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24 text-center">
        <div className="animate-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            {queueStatus
              ? `Queue ${queueStatus.queue_status} · ${queueStatus.waiting_count} waiting`
              : 'Real-time queue management'}
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-white leading-tight mb-6">
            Skip the wait,<br />
            <span className="text-teal-400">not the care.</span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            MediQueue lets you book a consultation token online and track your position in real time — so you spend less time waiting and more time healing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to={dashboardLink} className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Go to Dashboard <ChevronRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                  Get Started Free <ChevronRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="text-slate-300 hover:text-white font-medium text-lg px-6 py-4 transition-colors">
                  Sign In →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Live stats */}
        {queueStatus && (
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto animate-fade-in">
            {[
              { label: 'Now Serving', value: `#${queueStatus.current_token || 0}`, color: 'text-teal-400' },
              { label: 'In Queue', value: queueStatus.waiting_count, color: 'text-white' },
              { label: 'Next Token', value: `#${queueStatus.next_token_number}`, color: 'text-white' },
            ].map(item => (
              <div key={item.label} className="glass-card-light p-4 text-center">
                <p className={`text-2xl font-bold font-mono ${item.color}`}>{item.value}</p>
                <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-white mb-3">Everything you need</h2>
          <p className="text-slate-400">Three portals. One seamless system.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: Ticket,
              title: 'Patient Portal',
              color: 'text-teal-400',
              bg: 'bg-teal-500/10 border-teal-500/20',
              items: ['Register & login', 'Book tokens online', 'Track queue position', 'Real-time wait estimates'],
            },
            {
              icon: Activity,
              title: 'Doctor Dashboard',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10 border-blue-500/20',
              items: ['View full queue', 'Call next patient', 'Pause & resume queue', 'Skip absent patients'],
            },
            {
              icon: Shield,
              title: 'Admin Panel',
              color: 'text-purple-400',
              bg: 'bg-purple-500/10 border-purple-500/20',
              items: ['View all patients', 'Monitor all tokens', 'Queue analytics', 'Reset queue daily'],
            },
          ].map(card => (
            <div key={card.title} className="glass-card p-6 hover:border-slate-600/60 transition-all">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border mb-5 ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <h3 className="font-display text-xl text-white mb-4">{card.title}</h3>
              <ul className="space-y-2">
                {card.items.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${card.color.replace('text-', 'bg-')}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Why MediQueue */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Zap, title: 'Real-time', desc: 'Queue updates every 10 seconds — no page refresh needed.' },
            { icon: Users, title: 'Multi-role', desc: 'Separate, purpose-built dashboards for patients, doctors and admins.' },
            { icon: Clock, title: 'Wait Estimate', desc: 'Smart estimated wait times based on live queue depth.' },
          ].map(item => (
            <div key={item.title} className="glass-card-light p-6 text-center">
              <item.icon className="w-7 h-7 text-teal-400 mx-auto mb-3" />
              <h4 className="font-semibold text-white mb-1">{item.title}</h4>
              <p className="text-sm text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 text-center">
          <div className="glass-card p-10">
            <h2 className="font-display text-3xl text-white mb-3">Ready to try it?</h2>
            <p className="text-slate-400 mb-6">Register as a patient, doctor, or admin and explore the full system.</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
              Create Free Account <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
