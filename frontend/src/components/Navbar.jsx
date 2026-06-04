import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Activity, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = user?.role === 'patient'
    ? [
        { to: '/patient', label: 'Dashboard' },
        { to: '/patient/book', label: 'Book Token' },
        { to: '/patient/my-tokens', label: 'My Tokens' },
      ]
    : user?.role === 'doctor'
    ? [{ to: '/doctor', label: 'Queue Board' }]
    : user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Overview' },
        { to: '/admin/patients', label: 'Patients' },
        { to: '/admin/queue', label: 'Queue Control' },
      ]
    : []

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-display text-xl text-white">MediQueue</span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-teal-500/20 text-teal-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors">Login</Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden border-t border-slate-800 px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.to ? 'bg-teal-500/20 text-teal-400' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-800 mt-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
