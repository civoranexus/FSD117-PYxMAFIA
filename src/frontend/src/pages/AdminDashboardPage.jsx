import React, { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient, { getApiErrorMessage } from '../api/axios.js'

const ADMIN_BASE = '/admin'
const CONTACT_PAGE_SIZE = 25

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

const ConfirmVendorBlockToast = ({ vendorName, onCancel, onConfirm }) => {
  const [blockProducts, setBlockProducts] = useState(true)
  const [reason, setReason] = useState('')

  return (
    <div className="w-[380px] max-w-[92vw] rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl p-4">
      <div className="text-sm font-semibold text-slate-900">Block vendor?</div>
      <div className="mt-2 text-sm text-slate-700">
        Vendor: <span className="font-semibold">{vendorName || '—'}</span>
      </div>
      <div className="mt-2 text-xs text-slate-600">
        Blocking a vendor will prevent them from logging in and using vendor-only features.
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-800">
        <input type="checkbox" checked={blockProducts} onChange={(e) => setBlockProducts(e.target.checked)} />
        Also block (invalidate) all their products
      </label>

      <div className="mt-3">
        <label className="block text-xs font-semibold text-slate-700">Reason (optional)</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Too many fake/suspicious products"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-xl bg-slate-100 text-slate-900 px-3 py-2 text-xs font-semibold hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm({ blockProducts, reason })}
          className="rounded-xl bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700"
        >
          Block vendor
        </button>
      </div>
    </div>
  )
}

const VendorTerminateToast = ({ vendor, products, onCancel, onConfirm }) => {
  const [blockBeforeDelete, setBlockBeforeDelete] = useState(true)
  const [reason, setReason] = useState('')

  const list = Array.isArray(products) ? products : []
  const maxShow = 20
  const shown = list.slice(0, maxShow)
  const remaining = Math.max(0, list.length - shown.length)

  const counts = shown.reduce(
    (acc, p) => {
      const status = p?.qrStatus || 'unknown'
      acc.total += 1
      if (p?.isSuspicious) acc.suspicious += 1
      if (status === 'blocked') acc.blocked += 1
      if (status === 'active') acc.active += 1
      if (status === 'used') acc.used += 1
      if (status === 'generated') acc.generated += 1
      return acc
    },
    { total: 0, suspicious: 0, blocked: 0, active: 0, used: 0, generated: 0 }
  )

  return (
    <div className="w-[520px] max-w-[92vw] rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl p-4">
      <div className="text-sm font-semibold text-slate-900">Terminate vendor account?</div>
      <div className="mt-2 text-sm text-slate-700">
        Vendor: <span className="font-semibold">{vendor?.name || '—'}</span>
        <span className="mx-2">•</span>
        <span className="text-slate-600">{vendor?.email || '—'}</span>
      </div>
      <div className="mt-2 text-xs text-slate-600">
        Review the vendor’s products before deleting their account.
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
        <div className="text-xs font-semibold text-slate-700">
          Products found: <span className="text-slate-900">{list.length}</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-600">
          In preview: total {counts.total}, suspicious {counts.suspicious}, blocked {counts.blocked}, active {counts.active}
        </div>

        <div className="mt-3 max-h-56 overflow-auto rounded-xl bg-white ring-1 ring-slate-200">
          {shown.length === 0 ? (
            <div className="p-3 text-sm text-slate-600">No products for this vendor.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-semibold p-2">Product</th>
                  <th className="text-left font-semibold p-2">Status</th>
                  <th className="text-left font-semibold p-2">Flags</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => (
                  <tr key={p?._id} className="border-t border-slate-100">
                    <td className="p-2 text-slate-900">
                      <div className="font-semibold">{p?.productName || '—'}</div>
                      <div className="mt-0.5 text-xs text-slate-500">Batch: {p?.batchId || '—'}</div>
                    </td>
                    <td className="p-2">
                      <Badge tone={p?.isSuspicious || p?.qrStatus === 'blocked' ? 'red' : p?.qrStatus === 'active' ? 'emerald' : 'slate'}>
                        {p?.qrStatus || '—'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      {p?.isSuspicious ? <Badge tone="red">Suspicious</Badge> : <span className="text-xs text-slate-500">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {remaining > 0 ? <div className="mt-2 text-xs text-slate-600">And {remaining} more…</div> : null}
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm text-slate-800">
        <input type="checkbox" checked={blockBeforeDelete} onChange={(e) => setBlockBeforeDelete(e.target.checked)} />
        Block vendor + invalidate all products before deletion (recommended)
      </label>

      <div className="mt-3">
        <label className="block text-xs font-semibold text-slate-700">Reason (optional)</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Terminated after repeated suspicious activity"
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-xl bg-slate-100 text-slate-900 px-3 py-2 text-xs font-semibold hover:bg-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm({ blockBeforeDelete, reason })}
          className="rounded-xl bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700"
        >
          Terminate
        </button>
      </div>
    </div>
  )
}

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('suspicious')

  const [vendorSearch, setVendorSearch] = useState('')

  const [vendorMutatingId, setVendorMutatingId] = useState(null)

  const [stats, setStats] = useState(null)
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  const [contactMessages, setContactMessages] = useState([])
  const [contactTotal, setContactTotal] = useState(0)
  const [contactPage, setContactPage] = useState(1)
  const [contactSearch, setContactSearch] = useState('')
  const [contactStatus, setContactStatus] = useState('all')
  const [selectedContactId, setSelectedContactId] = useState(null)
  const [selectedContact, setSelectedContact] = useState(null)
  const [contactDetailLoading, setContactDetailLoading] = useState(false)

  const [loading, setLoading] = useState(false)

  const loadStats = async () => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/dashboard/stats`)
    setStats(data?.stats || null)
  }

  const loadVendors = async (search) => {
    const params = {}
    if (typeof search === 'string' && search.trim()) params.search = search.trim()

    const { data } = await apiClient.get(`${ADMIN_BASE}/vendors`, { params })
    setVendors(data?.vendors || [])
  }

  const loadSuspiciousProducts = async () => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/products`, {
      params: { suspicious: true },
    })
    setProducts(data?.products || [])
  }

  const loadVendorProducts = async (vendorId) => {
    if (!vendorId) return []
    const { data } = await apiClient.get(`${ADMIN_BASE}/products`, { params: { vendorId } })
    return Array.isArray(data?.products) ? data.products : []
  }

  const loadAuditLogs = async () => {
    const { data } = await apiClient.get(`${ADMIN_BASE}/audit-logs`, {
      params: { limit: 50 },
    })
    setAuditLogs(data?.logs || [])
  }

  const loadContactMessages = async ({ page, search, status } = {}) => {
    const params = {
      limit: CONTACT_PAGE_SIZE,
      page: typeof page === 'number' && page > 0 ? page : contactPage,
    }

    const s = typeof search === 'string' ? search.trim() : ''
    if (s) params.search = s

    if (typeof status === 'string' && status !== 'all') params.status = status

    const { data } = await apiClient.get(`${ADMIN_BASE}/contact-messages`, { params })
    setContactMessages(data?.messages || [])
    setContactTotal(typeof data?.total === 'number' ? data.total : 0)

    // Keep page in sync with backend response (if any)
    if (typeof data?.page === 'number') setContactPage(data.page)
  }

  const loadContactMessageDetail = async (id) => {
    if (!id) return
    setContactDetailLoading(true)
    try {
      const { data } = await apiClient.get(`${ADMIN_BASE}/contact-messages/${encodeURIComponent(id)}`)
      setSelectedContact(data?.message || null)
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load contact message details.'))
    } finally {
      setContactDetailLoading(false)
    }
  }

  const updateContactStatus = async (id, status) => {
    if (!id) return
    try {
      await apiClient.patch(`${ADMIN_BASE}/contact-messages/${encodeURIComponent(id)}/status`, { status })
      toast.success('Updated')
      await Promise.all([
        loadContactMessages({ page: contactPage, search: contactSearch, status: contactStatus }),
        loadContactMessageDetail(id),
      ])
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update contact status.'))
    }
  }

  const refresh = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadStats(),
        loadVendors(vendorSearch),
        loadSuspiciousProducts(),
        loadAuditLogs(),
        loadContactMessages({ page: contactPage, search: contactSearch, status: contactStatus }),
      ])
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to load admin dashboard data.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  useEffect(() => {
    if (activeTab !== 'vendors') return

    let cancelled = false
    const t = setTimeout(() => {
      if (cancelled) return
      loadVendors(vendorSearch).catch((e) => {
        toast.error(getApiErrorMessage(e, 'Failed to load vendors.'))
      })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [vendorSearch, activeTab])

  useEffect(() => {
    if (activeTab !== 'contacts') return

    let cancelled = false
    const t = setTimeout(() => {
      if (cancelled) return
      loadContactMessages({ page: contactPage, search: contactSearch, status: contactStatus }).catch((e) => {
        toast.error(getApiErrorMessage(e, 'Failed to load contact messages.'))
      })
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [contactSearch, contactStatus, contactPage, activeTab])

  const counts = useMemo(() => {
    return {
      suspicious: Array.isArray(products) ? products.length : 0,
      vendors: Array.isArray(vendors) ? vendors.length : 0,
      logs: Array.isArray(auditLogs) ? auditLogs.length : 0,
      contacts: typeof contactTotal === 'number' ? contactTotal : 0,
    }
  }, [products, vendors, auditLogs, contactTotal])

  const setProductReview = async (id, payload) => {
    try {
      await apiClient.patch(`${ADMIN_BASE}/products/${encodeURIComponent(id)}/review`, payload)
      toast.success('Updated')
      await Promise.all([loadStats(), loadSuspiciousProducts()])
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update product.'))
    }
  }

  const confirmToast = (title, message, confirmLabel = 'Confirm') => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <div className="w-[360px] max-w-[92vw] rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl p-4">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            <div className="mt-2 text-sm text-slate-700">{message}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  resolve(false)
                }}
                className="rounded-xl bg-slate-100 text-slate-900 px-3 py-2 text-xs font-semibold hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id)
                  resolve(true)
                }}
                className="rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800"
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      )
    })
  }

  const confirmVendorBlock = (vendor) => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <ConfirmVendorBlockToast
            vendorName={vendor?.name}
            onCancel={() => {
              toast.dismiss(t.id)
              resolve(null)
            }}
            onConfirm={(payload) => {
              toast.dismiss(t.id)
              resolve(payload)
            }}
          />
        ),
        { duration: Infinity }
      )
    })
  }

  const confirmVendorTerminate = (vendor, products) => {
    return new Promise((resolve) => {
      toast.custom(
        (t) => (
          <VendorTerminateToast
            vendor={vendor}
            products={products}
            onCancel={() => {
              toast.dismiss(t.id)
              resolve(null)
            }}
            onConfirm={(payload) => {
              toast.dismiss(t.id)
              resolve(payload)
            }}
          />
        ),
        { duration: Infinity }
      )
    })
  }

  const terminateVendor = async (vendor) => {
    if (!vendor?._id) return
    setVendorMutatingId(vendor._id)
    try {
      const products = await loadVendorProducts(vendor._id)
      const decision = await confirmVendorTerminate(vendor, products)
      if (!decision) return

      // Safety step: block vendor + optionally invalidate products before deletion
      if (decision.blockBeforeDelete) {
        await apiClient.patch(`${ADMIN_BASE}/vendors/${encodeURIComponent(vendor._id)}/block`, {
          isBlocked: true,
          blockProducts: true,
          reason: decision?.reason || 'Terminated',
        })
      }

      const ok = await confirmToast(
        'Delete vendor account?',
        'This permanently deletes the vendor user record. This action cannot be undone.',
        'Delete'
      )
      if (!ok) return

      await apiClient.delete(`${ADMIN_BASE}/users/${encodeURIComponent(vendor._id)}`)
      toast.success('Vendor account deleted')
      await Promise.all([loadStats(), loadVendors(vendorSearch), loadSuspiciousProducts(), loadAuditLogs()])
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to terminate vendor.'))
    } finally {
      setVendorMutatingId(null)
    }
  }

  const setVendorBlocked = async (vendor, nextBlocked) => {
    if (!vendor?._id) return

    if (!nextBlocked) {
      const ok = await confirmToast('Unblock vendor?', 'This will allow the vendor to use the system again.', 'Unblock')
      if (!ok) return
    }

    const blockPayload = nextBlocked ? await confirmVendorBlock(vendor) : null
    if (nextBlocked && !blockPayload) return

    setVendorMutatingId(vendor._id)
    try {
      const endpoint = nextBlocked
        ? `${ADMIN_BASE}/vendors/${encodeURIComponent(vendor._id)}/block`
        : `${ADMIN_BASE}/vendors/${encodeURIComponent(vendor._id)}/unblock`

      await apiClient.patch(endpoint, {
        isBlocked: nextBlocked,
        blockProducts: nextBlocked ? !!blockPayload?.blockProducts : false,
        reason: nextBlocked ? blockPayload?.reason || '' : '',
      })

      toast.success(nextBlocked ? 'Vendor blocked' : 'Vendor unblocked')
      await Promise.all([loadStats(), loadVendors(vendorSearch)])
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to update vendor status.'))
    } finally {
      setVendorMutatingId(null)
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

  const contactTone = (status) => {
    if (status === 'new') return 'amber'
    if (status === 'read') return 'sky'
    if (status === 'replied') return 'emerald'
    return 'slate'
  }

  const contactLabel = (status) => {
    if (status === 'replied') return 'acknowledged'
    return status || '—'
  }

  const tabs = [
    { key: 'suspicious', label: 'Suspicious Products', count: counts.suspicious },
    { key: 'vendors', label: 'Vendors', count: counts.vendors },
    { key: 'logs', label: 'Audit Logs', count: counts.logs },
    { key: 'contacts', label: 'Contact Queries', count: counts.contacts },
  ]

  const contactTotalPages = useMemo(() => {
    const total = typeof contactTotal === 'number' ? contactTotal : 0
    return Math.max(1, Math.ceil(total / CONTACT_PAGE_SIZE))
  }, [contactTotal])

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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Vendors</h3>
                  <p className="mt-1 text-xs text-slate-600">Search by vendor name.</p>
                </div>
                <div className="w-full sm:w-80">
                  <label className="block text-xs font-semibold text-slate-700">Search</label>
                  <input
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    placeholder="e.g. Rahul Traders"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  />
                </div>
              </div>
              <div className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-slate-200 bg-white">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="text-left font-semibold p-3">Name</th>
                      <th className="text-left font-semibold p-3">Email</th>
                      <th className="text-left font-semibold p-3">Status</th>
                      <th className="text-left font-semibold p-3">Created</th>
                      <th className="text-left font-semibold p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v) => (
                      <tr key={v._id} className="border-t border-slate-100">
                        <td className="p-3 text-slate-900 font-semibold">{v?.name || '—'}</td>
                        <td className="p-3 text-slate-700">{v?.email || '—'}</td>
                        <td className="p-3">
                          {v?.isBlocked ? <Badge tone="red">Blocked</Badge> : <Badge tone="emerald">Active</Badge>}
                        </td>
                        <td className="p-3 text-slate-600">{formatDateTime(v?.createdAt)}</td>
                        <td className="p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {v?.isBlocked ? (
                              <button
                                onClick={() => setVendorBlocked(v, false)}
                                disabled={vendorMutatingId === v._id}
                                className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60"
                              >
                                {vendorMutatingId === v._id ? 'Working…' : 'Unblock'}
                              </button>
                            ) : (
                              <button
                                onClick={() => setVendorBlocked(v, true)}
                                disabled={vendorMutatingId === v._id}
                                className="rounded-xl bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700 disabled:opacity-60"
                              >
                                {vendorMutatingId === v._id ? 'Working…' : 'Block'}
                              </button>
                            )}

                            <button
                              onClick={() => terminateVendor(v)}
                              disabled={vendorMutatingId === v._id}
                              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 disabled:opacity-60"
                            >
                              {vendorMutatingId === v._id ? 'Working…' : 'Terminate'}
                            </button>
                          </div>
                        </td>
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
              <div className="mt-4 overflow-x-auto rounded-2xl ring-1 ring-slate-200 bg-white">
                <table className="w-full min-w-[820px] text-sm">
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

          {activeTab === 'contacts' ? (
            <section className="mt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Contact queries</h3>
                  <p className="mt-1 text-xs text-slate-600">All Contact Us submissions. Click a row to inspect.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="w-full sm:w-80">
                    <label className="block text-xs font-semibold text-slate-700">Search</label>
                    <input
                      value={contactSearch}
                      onChange={(e) => {
                        setContactPage(1)
                        setContactSearch(e.target.value)
                      }}
                      placeholder="name, email, subject…"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                    />
                  </div>

                  <div className="w-full sm:w-44">
                    <label className="block text-xs font-semibold text-slate-700">Status</label>
                    <select
                      value={contactStatus}
                      onChange={(e) => {
                        setContactPage(1)
                        setContactStatus(e.target.value)
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                      <option value="all">All</option>
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="replied">Acknowledged</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-x-auto">
                    <div className="flex items-center justify-between p-3 border-b border-slate-100">
                      <div className="text-xs text-slate-600">
                        Page <span className="font-semibold">{contactPage}</span> of <span className="font-semibold">{contactTotalPages}</span>
                        <span className="mx-2">•</span>
                        Total <span className="font-semibold">{contactTotal}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setContactPage((p) => Math.max(1, p - 1))}
                          disabled={contactPage <= 1}
                          className="rounded-xl bg-slate-100 text-slate-900 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200 disabled:opacity-60"
                        >
                          Prev
                        </button>
                        <button
                          onClick={() => setContactPage((p) => Math.min(contactTotalPages, p + 1))}
                          disabled={contactPage >= contactTotalPages}
                          className="rounded-xl bg-slate-100 text-slate-900 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200 disabled:opacity-60"
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <table className="w-full min-w-[860px] text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="text-left font-semibold p-3">Subject</th>
                          <th className="text-left font-semibold p-3">From</th>
                          <th className="text-left font-semibold p-3">Status</th>
                          <th className="text-left font-semibold p-3">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!loading && contactMessages.length === 0 ? (
                          <tr className="border-t border-slate-100">
                            <td colSpan={4} className="p-6 text-slate-600">
                              No contact messages found.
                            </td>
                          </tr>
                        ) : null}

                        {contactMessages.map((m) => {
                          const selected = selectedContactId === m._id
                          return (
                            <tr
                              key={m._id}
                              className={
                                selected
                                  ? 'border-t border-slate-100 bg-slate-50 cursor-pointer'
                                  : 'border-t border-slate-100 hover:bg-slate-50 cursor-pointer'
                              }
                              onClick={() => {
                                setSelectedContactId(m._id)
                                setSelectedContact(null)
                                loadContactMessageDetail(m._id)
                              }}
                            >
                              <td className="p-3 text-slate-900">
                                <div className="font-semibold">{m?.subject || '—'}</div>
                              </td>
                              <td className="p-3 text-slate-700">
                                <div className="font-semibold">{m?.name || '—'}</div>
                                <div className="mt-0.5 text-xs text-slate-500">{m?.email || '—'}</div>
                              </td>
                              <td className="p-3">
                                <Badge tone={contactTone(m?.status)}>{contactLabel(m?.status)}</Badge>
                              </td>
                              <td className="p-3 text-slate-600">{formatDateTime(m?.createdAt)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
                    {!selectedContactId ? (
                      <div className="text-sm text-slate-600">Select a message to inspect.</div>
                    ) : contactDetailLoading ? (
                      <div className="text-sm text-slate-600">Loading details…</div>
                    ) : !selectedContact ? (
                      <div className="text-sm text-slate-600">No details available.</div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900">{selectedContact?.subject || 'Contact message'}</h4>
                                <Badge tone={contactTone(selectedContact?.status)}>{contactLabel(selectedContact?.status)}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                              From <span className="font-semibold">{selectedContact?.name || '—'}</span> • {selectedContact?.email || '—'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">Created: {formatDateTime(selectedContact?.createdAt)}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => updateContactStatus(selectedContactId, 'new')}
                            className="rounded-xl bg-slate-100 text-slate-900 px-3 py-2 text-xs font-semibold hover:bg-slate-200"
                          >
                            Mark new
                          </button>
                          <button
                            onClick={() => updateContactStatus(selectedContactId, 'read')}
                            className="rounded-xl bg-sky-600 text-white px-3 py-2 text-xs font-semibold hover:bg-sky-700"
                          >
                            Mark read
                          </button>
                          <button
                            onClick={() => updateContactStatus(selectedContactId, 'replied')}
                            className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-semibold hover:bg-emerald-700"
                          >
                            Mark acknowledged
                          </button>
                        </div>

                        <div className="mt-4">
                          <div className="text-xs font-semibold text-slate-700">Message</div>
                          <div className="mt-1 whitespace-pre-wrap break-words rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3 text-sm text-slate-800">
                            {selectedContact?.message || '—'}
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 text-xs text-slate-600">
                          <div>
                            <span className="font-semibold">Updated:</span> {formatDateTime(selectedContact?.updatedAt)}
                          </div>
                          <div>
                            <span className="font-semibold">IP:</span> {selectedContact?.ipAddress || '—'}
                          </div>
                          <div>
                            <span className="font-semibold">User-Agent:</span> {selectedContact?.userAgent || '—'}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardPage
