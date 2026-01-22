import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient, { getApiErrorMessage } from '../api/axios.js'

const ADMIN_BASE = '/admin'

const formatDateTime = (value) => {
  try {
    const d = new Date(value)
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
  } catch {
    return ''
  }
}

const Badge = ({ children, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-100 text-slate-800 ring-1 ring-slate-200',
    red: 'bg-red-100 text-red-700 ring-1 ring-red-200',
    amber: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
    emerald: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    sky: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  )
}

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('suspicious')

  const [stats, setStats] = useState(null)
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  const [loading, setLoading] = useState(false)

  const loadStats = async () => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/dashboard/stats`)
    setStats(data?.stats || null)
  }

  const loadVendors = async () => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/vendors`)
    setVendors(data?.vendors || [])
  }

  const loadSuspiciousProducts = async () => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/products`, {
      params: { suspicious: true },
    })
    setProducts(data?.products || [])
  }

  const loadAuditLogs = async () => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/audit-logs`, {
      params: { limit: 50 },
    })
    setAuditLogs(data?.logs || [])
  }

  const refresh = async () => {
    setLoading(true)
    try {
      await Promise.all([loadStats(), loadVendors(), loadSuspiciousProducts(), loadAuditLogs()])
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load admin dashboard data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const counts = useMemo(() => {
    return {
      suspicious: Array.isArray(products) ? products.length : 0,
      vendors: Array.isArray(vendors) ? vendors.length : 0,
      logs: Array.isArray(auditLogs) ? auditLogs.length : 0,
    }
  }, [products, vendors, auditLogs])

  const setProductReview = async (id, payload) => {
    try {
      await apiClient.patch(`${ADMIN_BASE}/products/${encodeURIComponent(id)}/review`, payload)
      toast.success('Updated')
      await Promise.all([loadStats(), loadSuspiciousProducts()])
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update product.'))
    }
  }

  const qrTone = (qrStatus, isSuspicious) => {
    if (isSuspicious) return 'red'
    if (qrStatus === 'blocked') return 'red'
    if (qrStatus === 'active') return 'emerald'
    if (qrStatus === 'used') return 'sky'
    if (qrStatus === 'generated') return 'amber'
    return 'slate'
  }

  const tabs = [
    { key: 'suspicious', label: 'Suspicious Products', count: counts.suspicious },
    { key: 'vendors', label: 'Vendors', count: counts.vendors },
    { key: 'logs', label: 'Audit Logs', count: counts.logs },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-1 px-4 pt-8 pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
              <p className="mt-1 text-sm text-slate-600">Review suspicious products, vendors, and scans.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
              <div className="text-xs text-slate-500">Users</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{stats?.users?.total ?? '—'}</div>
              <div className="mt-2 text-xs text-slate-600">
                Vendors: <span className="font-semibold">{stats?.users?.vendors ?? '—'}</span> • Admins:{' '}
                <span className="font-semibold">{stats?.users?.admins ?? '—'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
              <div className="text-xs text-slate-500">Products</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{stats?.products?.total ?? '—'}</div>
              <div className="mt-2 text-xs text-slate-600">
                Active: <span className="font-semibold">{stats?.products?.active ?? '—'}</span> • Blocked:{' '}
                <span className="font-semibold">{stats?.products?.blocked ?? '—'}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
              <div className="text-xs text-slate-500">Suspicious</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{stats?.products?.suspicious ?? '—'}</div>
              <div className="mt-2 text-xs text-slate-600">Marked suspicious by monitoring / admin review.</div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => {
                const selected = activeTab === t.key
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={
                      selected
                        ? 'rounded-xl bg-slate-900 text-white px-3 py-2 text-sm font-semibold'
                        : 'rounded-xl bg-slate-100 text-slate-800 px-3 py-2 text-sm font-semibold hover:bg-slate-200'
                    }
                  >
                    {t.label}
                    <span className={selected ? 'ml-2 text-xs text-white/80' : 'ml-2 text-xs text-slate-600'}>
                      {t.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {activeTab === 'suspicious' ? (
            <section className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Suspicious products</h3>
                <p className="text-xs text-slate-600">Showing products where <span className="font-semibold">isSuspicious=true</span></p>
              </div>

              <div className="mt-4 space-y-3">
                {!loading && products.length === 0 ? (
                  <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 text-sm text-slate-600">
                    No suspicious products right now.
                  </div>
                ) : null}

                {products.map((p) => (
                  <div key={p._id} className="bg-white rounded-2xl ring-1 ring-slate-200 p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-slate-900">{p?.productName || 'Untitled product'}</h4>
                          <Badge tone={qrTone(p?.qrStatus, p?.isSuspicious)}>{p?.qrStatus || '—'}</Badge>
                          {p?.isSuspicious ? <Badge tone="red">Suspicious</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Vendor: <span className="font-semibold">{p?.vendorName || p?.vendorId?.name || '—'}</span>
                          {p?.batchId ? (
                            <>
                              <span className="mx-2">•</span>
                              Batch: <span className="font-semibold">{p.batchId}</span>
                            </>
                          ) : null}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Created: {formatDateTime(p?.createdAt)}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setProductReview(p._id, { isSuspicious: true, qrStatus: 'blocked' })}
                          className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700"
                        >
                          Block
                        </button>
                        <button
                          onClick={() => setProductReview(p._id, { isSuspicious: false })}
                          className="rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200"
                        >
                          Mark safe
                        </button>
                        <button
                          onClick={() => setProductReview(p._id, { isSuspicious: false, qrStatus: 'active' })}
                          className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold hover:bg-emerald-700"
                        >
                          Unblock + Activate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeTab === 'vendors' ? (
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">Vendors</h3>
              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left font-semibold p-3">Name</th>
                      <th className="text-left font-semibold p-3">Email</th>
                      <th className="text-left font-semibold p-3">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v) => (
                      <tr key={v._id} className="border-t border-slate-100">
                        <td className="p-3 text-slate-900 font-semibold">{v?.name || '—'}</td>
                        <td className="p-3 text-slate-700">{v?.email || '—'}</td>
                        <td className="p-3 text-slate-600">{formatDateTime(v?.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeTab === 'logs' ? (
            <section className="mt-6">
              <h3 className="text-sm font-semibold text-slate-900">Recent audit logs</h3>
              <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left font-semibold p-3">Time</th>
                      <th className="text-left font-semibold p-3">Product</th>
                      <th className="text-left font-semibold p-3">Vendor</th>
                      <th className="text-left font-semibold p-3">Result</th>
                      <th className="text-left font-semibold p-3">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((l) => (
                      <tr key={l._id} className="border-t border-slate-100">
                        <td className="p-3 text-slate-600">{formatDateTime(l?.scannedAt)}</td>
                        <td className="p-3 text-slate-900">
                          <div className="font-semibold">{l?.productId?.productName || '—'}</div>
                          <div className="mt-0.5 text-xs text-slate-500">QR: {String(l?.qrCode || '').slice(0, 10)}…</div>
                        </td>
                        <td className="p-3 text-slate-700">{l?.vendorId?.name || '—'}</td>
                        <td className="p-3">
                          <Badge tone={l?.scanResult === 'Blocked' ? 'red' : l?.scanResult === 'Valid' ? 'emerald' : 'slate'}>
                            {l?.scanResult || '—'}
                          </Badge>
                        </td>
                        <td className="p-3 text-slate-700">{l?.location || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardPage
