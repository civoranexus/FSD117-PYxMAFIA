import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient from '../api/axios.js'
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../utils/apiError.js'

const RegisterPage = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('')

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Here you would typically send 'data' to your backend API
    try {
      setSubmitting(true)
      const response = await apiClient.post('/auth/register', data);
      console.log('Registration successful:', response.data);
      const vendorName =
        response?.data?.vendorName ||
        response?.data?.user?.vendorName ||
        response?.data?.user?.name ||
        data?.vendorName ||
        data?.name ||
        '';

      if (vendorName) {
        window.localStorage.setItem('vendorName', String(vendorName));
      }

      toast.success('Registration successful')
      navigate('/vendor-dashboard', { state: { vendorName } });
    } catch (error) {
      console.error('Registration error:', error);
      const message = getApiErrorMessage(error, 'Registration failed')
      setFormError(message)
      toast.error(message)

      // Clear password on failure without wiping email/name.
      const passwordInput = e.target?.querySelector?.('input[name="password"]')
      if (passwordInput) passwordInput.value = ''
    } finally {
      setSubmitting(false)
    }
  };
// Example: Simulate successful registration


return (
  <div className="min-h-screen bg-slate-50">
    <NavigationBar tagline="Create your account" />

    <main className="px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h1 className="text-2xl font-semibold text-slate-900">Create Vendor Account</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign up to access verification tools and vendor features.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="phone_no">
                phone number
              </label>
              <input
                id="phone_no"
                name="phone_no"
                type="tel"
                autoComplete="tel"
                placeholder="1234567890"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-slate-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-slate-300"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-slate-300"
              />
            </div> */}

            {/* <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue="vendor"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-slate-300"
              >
                <option value="user">User</option>
                <option value="vendor">Vendor</option>
              </select>
            </div> */}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-black text-white py-3 text-sm font-semibold hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating account…' : 'Register'}
            </button>

            {formError ? (
              <div className="rounded-xl bg-red-50 ring-1 ring-red-200 p-3 text-sm text-red-700">
                {formError}
              </div>
            ) : null}

            <p className="text-sm text-slate-600 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-slate-900 underline underline-offset-4 hover:text-black">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  </div>
)
}

export default RegisterPage