import React, { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Keep the scan entrypoint eager for fastest first render.
import HomePage from '../pages/HomePage.jsx'

// Lazy-load non-critical routes to reduce initial bundle size (better mobile performance).
const ProductPage = lazy(() => import('../pages/ProductPage.jsx'))
const AboutPage = lazy(() => import('../pages/AboutPage.jsx'))
const ContactUsPage = lazy(() => import('../pages/ContactUsPage.jsx'))
const LoginPage = lazy(() => import('../pages/LoginPage.jsx'))
const RegisterPage = lazy(() => import('../pages/RegisterPage.jsx'))
const VendorPage = lazy(() => import('../pages/VendorPage.jsx'))
const VendorProductFormPage = lazy(() => import('../pages/VendorProductFormPage.jsx'))
const VendorProductDetailsPage = lazy(() => import('../pages/VendorProductDetailsPage.jsx'))
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage.jsx'))

const RouteFallback = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="vv-surface w-full max-w-sm rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-full border-[3px] border-[rgba(2,57,74,0.18)] border-t-[var(--vv-primary)] animate-spin"
            aria-hidden="true"
          />
          <div>
            <div className="text-sm font-semibold text-slate-900">Loading…</div>
            <div className="mt-1 text-xs text-slate-600">Preparing the page.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const AppRouter = () => {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product" element={<ProductPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login/:role" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/vendor-dashboard" element={<VendorPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/vendor/products/new" element={<VendorProductFormPage />} />
          <Route path="/vendor/products/edit" element={<VendorProductFormPage />} />
          <Route path="/vendor/products/:id" element={<VendorProductDetailsPage />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default AppRouter
