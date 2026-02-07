import React from 'react'
import { formatDateTime } from '../utils/productHelpers'

const AuditLogList = ({ logs, loading }) => {
    return (
        <div className="mt-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">Recent scans</h3>
                {loading ? <span className="text-xs text-slate-500">Loading…</span> : null}
            </div>

            {!loading && logs.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No scan history available.</p>
            ) : null}

            {logs.length > 0 ? (
                <div className="mt-3 space-y-2">
                    {logs.map((log) => (
                        <div
                            key={log?._id || `${log?.scannedAt}-${log?.scanResult}`}
                            className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 flex items-start justify-between gap-4"
                        >
                            <div>
                                <div className="text-sm font-semibold text-slate-900">{log?.scanResult || 'Scan'}</div>
                                <div className="mt-1 text-xs text-slate-600">{log?.location || 'Unknown location'}</div>
                            </div>
                            <div className="text-xs text-slate-600 shrink-0">{formatDateTime(log?.scannedAt)}</div>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

export default AuditLogList
