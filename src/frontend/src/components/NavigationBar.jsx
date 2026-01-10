import React from 'react'
import { Link } from 'react-router-dom'

const NavigationBar = () => {
  const buttonClass =
    'inline-flex items-center justify-center rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm motion-safe:transition motion-safe:duration-200 hover:bg-slate-900 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-black/20'

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200 motion-safe:transition-shadow motion-safe:duration-200">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-semibold text-slate-900">
            VendorVerify
          </Link>
        </div>

        <Link to="/login" className={buttonClass}>
          Login
        </Link>
      </div>
    </header>
  )
}

export default NavigationBar