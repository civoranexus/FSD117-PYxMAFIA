import React, { useState } from 'react'
import apiClient, { getApiErrorMessage } from '../api/axios'
import toast from 'react-hot-toast'

const ReportFakeModal = ({ productId }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [reason, setReason] = useState('')
    const [details, setDetails] = useState('')
    const [reporterName, setReporterName] = useState('')
    const [reporterEmail, setReporterEmail] = useState('')

    const submitFakeReport = async () => {
        if (!productId) return
        const reasonTrimmed = String(reason || '').trim()
        if (!reasonTrimmed) {
            toast.error('Please enter a reason for the report.')
            return
        }

        setSubmitting(true)
        try {
            await apiClient.post(`/audit/public/product/${encodeURIComponent(productId)}/report-fake`, {
                reason: reasonTrimmed,
                details: String(details || '').trim(),
                reporterName: String(reporterName || '').trim(),
                reporterEmail: String(reporterEmail || '').trim(),
            })

            setSubmitted(true)
            setIsOpen(false)
            toast.success('Report submitted. Thank you.')
        } catch (e) {
            toast.error(getApiErrorMessage(e, 'Failed to submit report. Please try again.'))
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="mt-6 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold text-slate-900">Think this product is fake?</div>
                    <div className="mt-1 text-xs text-slate-600">
                        Send a report to the admin for review. This does not immediately block the product.
                    </div>
                </div>

                <button
                    type="button"
                    disabled={!productId || submitting || submitted}
                    onClick={() => setIsOpen((v) => !v)}
                    className="shrink-0 rounded-xl bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                    {submitted ? 'Reported' : isOpen ? 'Close' : 'Report as fake'}
                </button>
            </div>

            {isOpen ? (
                <div className="mt-4 grid grid-cols-1 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700">Reason *</label>
                        <input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. QR looks tampered / product details don't match"
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600/20"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700">Details (optional)</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            rows={3}
                            placeholder="Add any context that could help the admin verify."
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600/20"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700">Your name (optional)</label>
                            <input
                                value={reporterName}
                                onChange={(e) => setReporterName(e.target.value)}
                                placeholder="Name"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600/20"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700">Email (optional)</label>
                            <input
                                value={reporterEmail}
                                onChange={(e) => setReporterEmail(e.target.value)}
                                placeholder="Email"
                                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-600/20"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl bg-white text-slate-900 px-3 py-2 text-xs font-semibold ring-1 ring-slate-200 hover:bg-slate-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={submitFakeReport}
                            className="rounded-xl bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                        >
                            {submitting ? 'Submitting…' : 'Submit report'}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default ReportFakeModal
