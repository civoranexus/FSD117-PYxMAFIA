import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar.jsx'
import QRScanner from '../components/QRScanner.jsx';
import apiClient from '../api/axios.js';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast'
import { getApiErrorMessage } from '../utils/apiError.js'

const HomePage = () => {

    const [showScanner, setShowScanner] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [scanError, setScanError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const verifyQr = (qrText) => {
        setShowScanner(false);
        console.log("Scanned QR:", qrText);

        setScanError('');
        setIsVerifying(true);

        return apiClient.get(`/products/${encodeURIComponent(qrText)}`)
            .then(response => {
                console.log("Verification result:", response.data);
                const data = response.data;

                const invalidByFlag =
                    data?.valid === false ||
                    data?.verified === false ||
                    data?.isValid === false ||
                    data?.isVerified === false ||
                    data?.success === false;

                if (invalidByFlag) {
                    const msg = data?.message || 'Product verification failed.'
                    setScanError(msg);
                    toast.error(msg);
                    return;
                }

                navigate(`/product?qr=${encodeURIComponent(qrText)}`, {
                    state: {
                        qr: qrText,
                        productResult: data,
                    },
                });
            })
            .catch(error => {
                console.error("Verification error:", error);
                const message = getApiErrorMessage(error, 'Unable to verify QR code. Please try again.')
                setScanError(message);
                toast.error(message)
                setShowScanner(false);
            })
            .finally(() => {
                setIsVerifying(false);
            });
    }

    const handleScan = (result) => {
        verifyQr(result);
    };

    const onPickImage = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        setScanError('');
        setShowScanner(false);
        setIsVerifying(true);

        try {
            // Decode QR from image locally in browser
            const html5QrCode = new Html5Qrcode('qr-file-reader');
            const decodedText = await html5QrCode.scanFile(file, true);
            await html5QrCode.clear();
            await verifyQr(decodedText);
        } catch (err) {
            console.error('QR image decode failed:', err);
            const message = 'Could not read a QR code from that image. Please try a clearer photo.'
            setScanError(message);
            toast.error(message)
            setIsVerifying(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <NavigationBar />

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


                <section id="scan" className="px-4 mt-8">
                    <div className="mx-auto w-full max-w-lg">
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5">

                            {/* Camera Preview Box */}
                            <div
                                className="w-full h-56 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden ring-1 ring-slate-200"
                            >
                                {showScanner ? (
                                    <QRScanner onScan={handleScan} />
                                ) : (
                                    <span className="text-slate-400 text-sm">Camera Preview Area</span>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowScanner(true)}
                                    disabled={isVerifying}
                                    className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isVerifying ? 'Verifying…' : 'Use Camera'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isVerifying}
                                    className="w-full bg-white text-slate-900 py-3 rounded-xl font-semibold ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Upload QR Image
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={onPickImage}
                            />

                            {scanError ? (
                                <p className="mt-3 text-sm text-red-600 text-center">{scanError}</p>
                            ) : null}

                            
                        </div>
                    </div>
                </section>

                {/* Hidden mount point used by html5-qrcode scanFile() */}
                <div id="qr-file-reader" className="hidden" />


                {/* Scan Section */}
                {/* <section id="scan" className="px-4 mt-8">
                    <div className="mx-auto w-full max-w-lg">
                        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-5">
                            <div className="w-full h-48 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm ring-1 ring-slate-200">
                                Camera Preview Area
                            </div>

                            <button
                                type="submit"
                                // onSubmit={handleScan}
                                className="mt-4 w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20"
                            >
                                Scan QR Code
                                <QRScanner onScan={handleScan} />
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
                </section> */}

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