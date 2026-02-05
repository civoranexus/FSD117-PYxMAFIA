import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/axios.js'
import toast from 'react-hot-toast'

const NavigationBar = () => {
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const buttonClass =
    'vv-btn-primary inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold shadow-sm motion-safe:transition motion-safe:duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[rgba(2,57,74,0.25)]'

  const role = typeof window !== 'undefined' ? window.localStorage.getItem('role') : ''

  const logout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      // Important: Express' default JSON parser is strict (objects/arrays only).
      // Sending `null` causes: "Unexpected token 'n', \"null\" is not valid JSON".
      await apiClient.post('/auth/logout', {}, { skipGlobalLoader: true })
    } catch {
      // ignore
    } finally {
      window.localStorage.removeItem('role')
      window.localStorage.removeItem('vendorName')
      toast.success('Logged out')
      navigate('/')
      setLoggingOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 motion-safe:transition-shadow motion-safe:duration-200">
      <div className="px-4 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-semibold text-[var(--vv-primary)]">
            VendorVerify
          </Link>
          <nav className="hidden sm:flex items-center gap-1 ml-4">
            <Link to="/about" className="text-sm vv-muted hover:text-[var(--vv-text)] px-3 py-1.5 rounded-lg hover:bg-[rgba(204,231,236,0.45)] transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm vv-muted hover:text-[var(--vv-text)] px-3 py-1.5 rounded-lg hover:bg-[rgba(204,231,236,0.45)] transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Mobile menu */}
          <div className="relative sm:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="vv-btn-ghost rounded-xl px-3 py-2 text-sm font-semibold"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              Menu
            </button>

            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-52 max-w-[80vw] rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl overflow-hidden">
                <Link
                  to="/about"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-slate-900 hover:bg-slate-50"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-sm text-slate-900 hover:bg-slate-50"
                >
                  Contact
                </Link>
                {role === 'admin' ? (
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-900 hover:bg-slate-50"
                  >
                    Admin Dashboard
                  </Link>
                ) : role === 'vendor' ? (
                  <Link
                    to="/vendor-dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-slate-900 hover:bg-slate-50"
                  >
                    Vendor Dashboard
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>

          {role === 'admin' ? (
            <Link to="/admin-dashboard" className="vv-btn-ghost rounded-xl px-4 py-2 text-sm font-semibold">
              Admin
            </Link>
          ) : role === 'vendor' ? (
            <Link to="/vendor-dashboard" className="vv-btn-ghost rounded-xl px-4 py-2 text-sm font-semibold">
              Dashboard
            </Link>
          ) : null}

          {role ? (
            <button onClick={logout} className={buttonClass} disabled={loggingOut}>
              {loggingOut ? 'Logging out…' : 'Logout'}
            </button>
          ) : (
            <Link to="/login" className={buttonClass}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default NavigationBar