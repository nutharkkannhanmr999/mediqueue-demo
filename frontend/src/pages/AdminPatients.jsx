import { useState, useEffect } from 'react'
import { adminAPI } from '../api/client'
import { Search, Users, Phone, Mail, Calendar } from 'lucide-react'

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    adminAPI.patients()
      .then(r => setPatients(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone && p.phone.includes(search))
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl text-white">Patient Records</h1>
          <p className="text-slate-400 text-sm mt-1">{patients.length} registered patients</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patients…"
            className="input-field pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">{search ? 'No patients match your search' : 'No patients registered yet'}</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Table for desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/60">
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Patient</th>
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Contact</th>
                  <th className="text-left text-xs uppercase tracking-widest text-slate-500 font-medium px-6 py-4">Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-teal-400">{p.name[0].toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{p.name}</p>
                          <p className="text-xs text-slate-500">ID #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> {p.email}
                      </p>
                      {p.phone && (
                        <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-500" /> {p.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for mobile */}
          <div className="sm:hidden divide-y divide-slate-700/40">
            {filtered.map(p => (
              <div key={p.id} className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-teal-500/20 border border-teal-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-teal-400">{p.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{p.name}</p>
                    <p className="text-xs text-slate-500">ID #{p.id}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                  <Mail className="w-3 h-3" /> {p.email}
                </p>
                {p.phone && <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {p.phone}
                </p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
