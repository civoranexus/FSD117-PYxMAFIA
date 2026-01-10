import React from 'react'
import NavigationBar from '../components/NavigationBar.jsx'

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar tagline="Trust your purchase." />

      <main className="px-4 py-10">
        <div className="mx-auto w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <h1 className="text-2xl font-semibold text-slate-900">About VendorVerify</h1>
            <p className="mt-2 text-sm text-slate-600">
              VendorVerify helps customers verify product authenticity by scanning a QR code and
              validating it against trusted manufacturer/vendor records.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-slate-700">
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="font-medium text-slate-900">Secure</div>
                <div className="mt-1 text-slate-600">Designed to reduce fraud and counterfeits.</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="font-medium text-slate-900">Instant</div>
                <div className="mt-1 text-slate-600">Quick verification experience on mobile.</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="font-medium text-slate-900">Verified</div>
                <div className="mt-1 text-slate-600">Results based on vendor/manufacturer data.</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AboutPage
