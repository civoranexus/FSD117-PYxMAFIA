import React from 'react'
import NavigationBar from '../components/NavigationBar.jsx'

const HomePage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar/>

            <main className="flex-1 pb-24">
                {/* Hero */}
                <section id="home" className="px-4 pt-10 text-center">
                    <div className="mx-auto w-full max-w-xl">
                        <h2 className="text-3xl font-bold leading-tight text-slate-900">
                            Verify Your Product Instantly
                        </h2>
                        <p className="mt-3 text-slate-600 text-sm">
                            Scan a QR code on your package to confirm authenticity in seconds.
                        </p>
                    </div>
                </section>

                {/* Scan Section */}
                <section id="scan" className="px-4 mt-8">
                    <div className="mx-auto w-full max-w-lg">
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5">
                            <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm ring-1 ring-slate-200">
                                Camera Preview Area
                            </div>

                            <button
                                type="button"
                                className="mt-4 w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20"
                            >
                                Scan QR Code
                            </button>

                            <div className="mt-3 text-center">
                                <a
                                    href="#"
                                    className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-4"
                                >
                                    Upload QR Image
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="help" className="px-4 mt-10">
                    <div className="mx-auto w-full max-w-lg">
                        <h3 className="font-semibold text-slate-900">How It Works</h3>

                        <div className="mt-4 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                                <p className="text-sm text-slate-600">Scan the QR</p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                                <p className="text-sm text-slate-600">We verify it</p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                                <p className="text-sm text-slate-600">You see the result</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Strip */}
                <section className="px-4 mt-10">
                    <div className="mx-auto w-full max-w-lg">
                        <div className="bg-white rounded-2xl p-4 flex justify-around text-xs text-slate-600 shadow-sm ring-1 ring-slate-200">
                            <span className="inline-flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Secure
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-amber-500" />
                                Instant
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-sky-500" />
                                Verified
                            </span>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Navigation (mobile-first) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between text-xs text-slate-600">
                <a href="#home" className="px-2 py-1 rounded-lg hover:bg-slate-100">Home</a>
                <a href="#scan" className="px-2 py-1 rounded-lg hover:bg-slate-100">Scan</a>
                <a href="#help" className="px-2 py-1 rounded-lg hover:bg-slate-100">Help</a>
            </nav>
        </div>
    )
}

export default HomePage