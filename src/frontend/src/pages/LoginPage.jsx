import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient from '../api/axios.js'

const LoginPage = () => {

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Handle login logic here
    const formData = new FormData(e.target)
    const data = Object.fromEntries(formData.entries())
    try {
      const response = await apiClient.post('/auth/login', data);
      console.log('Login successful:', response.data);
      navigate('/vendor-dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar/>

      <main className="px-4 py-10">
        <div className="mx-auto w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <h1 className="text-2xl font-semibold text-slate-900">Vendor Login</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-black text-white py-3 text-sm font-semibold hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20"
              >
                Login
              </button>

              <div className="flex items-center justify-between text-sm">
                <a href="#" className="text-slate-600 hover:text-slate-900 underline underline-offset-4">
                  Forgot password?
                </a>

                <Link
                  to="/register"
                  className="text-slate-600 hover:text-slate-900 underline underline-offset-4"
                >
                  Create an account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
