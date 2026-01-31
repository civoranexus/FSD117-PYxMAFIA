import React from 'react'
import NavigationBar from '../components/NavigationBar.jsx'

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar tagline="Trust your purchase." />

      <main className="px-4 py-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-8">
            <h1 className="text-3xl font-semibold text-slate-900">About VendorVerify</h1>
            <p className="mt-3 text-base text-slate-600">
              VendorVerify is a cutting-edge platform designed to combat counterfeit products and protect both vendors and consumers through secure, blockchain-inspired product authentication.
            </p>

            {/* Mission Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Our Mission</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                We believe in building trust between vendors and consumers by ensuring every product can be verified for authenticity. In a world where counterfeit goods threaten brand reputation and consumer safety, VendorVerify provides a reliable solution that maintains credibility and transparency throughout the supply chain.
              </p>
            </div>

            {/* How We Help Vendors */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">How We Help Vendors</h2>
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Brand Protection</h3>
                    <p className="mt-1 text-sm text-slate-600">Safeguard your brand reputation by preventing counterfeit products from entering the market. Each product is assigned a unique QR code that cannot be duplicated.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Easy Product Management</h3>
                    <p className="mt-1 text-sm text-slate-600">Upload product details, generate QR codes, and manage your entire product catalog from a single, intuitive dashboard.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Build Customer Trust</h3>
                    <p className="mt-1 text-sm text-slate-600">Demonstrate your commitment to quality and authenticity, increasing customer confidence and loyalty to your brand.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Track & Trace</h3>
                    <p className="mt-1 text-sm text-slate-600">Monitor when and where your products are verified, gaining valuable insights into product distribution and customer engagement.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* How We Help Consumers */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">How We Help Consumers</h2>
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Instant Verification</h3>
                    <p className="mt-1 text-sm text-slate-600">Simply scan the QR code on any product to instantly verify its authenticity before making a purchase decision.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Protect Your Investment</h3>
                    <p className="mt-1 text-sm text-slate-600">Avoid counterfeit products that may be unsafe or of poor quality. Ensure you're getting genuine products worth your money.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Complete Product Information</h3>
                    <p className="mt-1 text-sm text-slate-600">Access detailed product information including manufacturing date, batch number, and vendor details directly from the verification screen.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">Peace of Mind</h3>
                    <p className="mt-1 text-sm text-slate-600">Shop with confidence knowing you have the power to verify authenticity at your fingertips, anytime, anywhere.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintaining Credibility Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Maintaining Credibility</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Our platform is built on the foundation of trust and transparency. We employ advanced security measures and authentication protocols to ensure the integrity of every verification:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-medium text-slate-900">🔒 Secure Database</div>
                  <div className="mt-1 text-sm text-slate-600">All product records are stored in an encrypted, tamper-proof database with strict access controls.</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-medium text-slate-900">🔑 Unique Identifiers</div>
                  <div className="mt-1 text-slate-600">Each product receives a cryptographically generated unique QR code that cannot be replicated or forged.</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-medium text-slate-900">📊 Audit Trails</div>
                  <div className="mt-1 text-sm text-slate-600">Every verification attempt is logged with timestamp and location data for complete traceability.</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <div className="font-medium text-slate-900">✅ Verified Vendors</div>
                  <div className="mt-1 text-sm text-slate-600">Only registered and verified vendors can add products, ensuring accountability throughout the system.</div>
                </div>
              </div>
            </div>

            {/* Authentication Process */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">Ensuring Product Authentication</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Our authentication process is designed to be both robust and user-friendly:
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">1</div>
                  <div className="pt-1">
                    <h3 className="font-medium text-slate-900">Product Registration</h3>
                    <p className="mt-1 text-sm text-slate-600">Vendors register authentic products with complete details including name, description, serial numbers, and images.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">2</div>
                  <div className="pt-1">
                    <h3 className="font-medium text-slate-900">QR Code Generation</h3>
                    <p className="mt-1 text-sm text-slate-600">Our system generates a unique, encrypted QR code linked exclusively to that specific product in our database.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">3</div>
                  <div className="pt-1">
                    <h3 className="font-medium text-slate-900">Consumer Scans</h3>
                    <p className="mt-1 text-sm text-slate-600">Consumers scan the QR code using their smartphone camera or our mobile app to initiate verification.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-semibold text-sm">4</div>
                  <div className="pt-1">
                    <h3 className="font-medium text-slate-900">Instant Validation</h3>
                    <p className="mt-1 text-sm text-slate-600">The system cross-references the scanned code against our secure database and returns an immediate authenticity result with product details.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <div className="rounded-xl bg-slate-900 p-6 text-center">
                <h3 className="text-lg font-semibold text-white">Join VendorVerify Today</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Whether you're a vendor looking to protect your brand or a consumer seeking peace of mind, VendorVerify is here to ensure authenticity at every step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AboutPage
