import React from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import apiClient from '../api/axios.js'
import toast from 'react-hot-toast'

const NavigationBar = () => {
  const navigate = useNavigate()

  const buttonClass =
    'inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm motion-safe:transition motion-safe:duration-200 hover:bg-slate-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-black/20'

  const role = typeof window !== 'undefined' ? window.localStorage.getItem('role') : ''

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout', null, { skipGlobalLoader: true })
    } catch {
      // ignore
    } finally {
      window.localStorage.removeItem('role')
      window.localStorage.removeItem('vendorName')
      toast.success('Logged out')
      navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 motion-safe:transition-shadow motion-safe:duration-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            VendorVerify
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' ? (
            <Link to="/admin-dashboard" className="rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200">
              Admin
            </Link>
          ) : role === 'vendor' ? (
            <Link to="/vendor-dashboard" className="rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200">
              Dashboard
            </Link>
          ) : null}

          {role ? (
            <button onClick={logout} className={buttonClass}>
              Logout
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