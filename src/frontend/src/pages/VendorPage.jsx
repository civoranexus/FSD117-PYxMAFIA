import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient from '../api/axios.js'

const PRODUCT_BASE = '/products'

const STATUS = {
  GENERATED: 'generated',
  ACTIVE: 'active',
  USED: 'used',
  BLOCKED: 'blocked',
}

const statusMeta = {
  [STATUS.GENERATED]: {
    label: 'Generated',
    badge: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
    card: 'bg-amber-50 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
  },
  [STATUS.ACTIVE]: {
    label: 'Active',
    badge: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200',
    card: 'bg-emerald-50 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  [STATUS.USED]: {
    label: 'Used',
    badge: 'bg-sky-100 text-sky-800 ring-1 ring-sky-200',
    card: 'bg-sky-50 ring-1 ring-sky-200',
    dot: 'bg-sky-500',
  },
  [STATUS.BLOCKED]: {
    label: 'Blocked',
    badge: 'bg-slate-800 text-white ring-1 ring-slate-700',
    card: 'bg-slate-900 text-slate-50 ring-1 ring-slate-700',
    dot: 'bg-slate-400',
  },
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

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

const confirmToast = (message) => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="w-[320px] rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl p-4">
          <div className="text-sm font-semibold text-slate-900">Confirm</div>
          <div className="mt-1 text-sm text-slate-600">{message}</div>
          <div className="mt-3 flex justify-end gap-2">
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
              className="rounded-xl bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    )
  })
}

const VendorPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [activeTab, setActiveTab] = useState('all')
  const [openActionsForId, setOpenActionsForId] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const actionsRef = useRef(null)

  const vendorName = useMemo(() => {
    return location?.state?.vendorName || window.localStorage.getItem('vendorName') || ''
  }, [location?.state?.vendorName])

  const normalizedProducts = useMemo(() => {
    const items = Array.isArray(products) ? products : []
    return items.map((p) => {
      const status = (p?.isSuspicious ? STATUS.BLOCKED : (p?.qrStatus || p?.status)) || STATUS.GENERATED
      return {
        ...p,
        id: p?.id ?? p?._id ?? makeId(),
        productName: p?.productName ?? p?.name ?? 'Untitled product',
        batchId: p?.batchId ?? p?.batchNo ?? '',
        vendorName: p?.vendorName ?? '',
        qrStatus: status,
        createdAt: p?.createdAt ?? Date.now(),
      }
    })
  }, [products])

  const vendorProducts = useMemo(() => {
    // Backend already scopes /products to the authenticated vendorId.
    // Filtering again by vendorName can hide products when localStorage contains a stale name
    // (e.g. after switching accounts), so we rely on backend scoping instead.
    return normalizedProducts
  }, [normalizedProducts])

  const counts = useMemo(() => {
    const base = { all: vendorProducts.length, generated: 0, active: 0, used: 0, blocked: 0 }
    for (const p of vendorProducts) {
      if (base[p.qrStatus] !== undefined) base[p.qrStatus] += 1
      else base.generated += 1
    }
    return base
  }, [vendorProducts])

  const filteredProducts = useMemo(() => {
    if (activeTab === 'all') return vendorProducts
    return vendorProducts.filter((p) => p.qrStatus === activeTab)
  }, [vendorProducts, activeTab])

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: STATUS.GENERATED, label: 'Generated', count: counts.generated },
    { key: STATUS.ACTIVE, label: 'Active', count: counts.active },
    { key: STATUS.USED, label: 'Used', count: counts.used },
    { key: STATUS.BLOCKED, label: 'Blocked', count: counts.blocked },
  ]

  const fetchProducts = async () => {
    setFetchError('')
    setLoading(true)
    try {
      const res = await apiClient.get(`${PRODUCT_BASE}/`)
      const list = Array.isArray(res.data) ? res.data : res.data?.data || res.data?.products || []
      setProducts(Array.isArray(list) ? list : [])
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to fetch products. Check backend URL/CORS and that the server is running.'
      setFetchError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (location?.state?.refresh) fetchProducts()
  }, [location?.state?.refresh])

  useEffect(() => {
    const onDocClick = (e) => {
      if (!openActionsForId) return
      if (actionsRef.current && actionsRef.current.contains(e.target)) return
      setOpenActionsForId(null)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [openActionsForId])

  const startEdit = (product) => {
    navigate('/vendor/products/edit', { state: { mode: 'edit', product } })
  }

  const openDetails = (product) => {
    const id = product?.id ?? product?._id
    if (!id) return
    setOpenActionsForId(null)
    navigate(`/vendor/products/${encodeURIComponent(id)}`, { state: { product } })
  }

  const onDelete = async (product) => {
    const ok = await confirmToast(`Delete "${product.productName}"? This cannot be undone.`)
    if (!ok) return

    setOpenActionsForId(null)
    const id = product?.id ?? product?._id
    if (!id) return

    try {
      await apiClient.post(`${PRODUCT_BASE}/delete/${encodeURIComponent(id)}`)
      setProducts((prev) => prev.filter((p) => (p.id ?? p._id) !== id))
      toast.success('Product deleted')
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || 'Failed to delete product.'
      toast.error(message)
    }
  }

  const onActivate = async (product) => {
    const id = product?.id ?? product?._id
    if (!id) return
    setOpenActionsForId(null)

    try {
      await apiClient.post(`${PRODUCT_BASE}/activate/${encodeURIComponent(id)}`)
      toast.success('Product activated')
      await fetchProducts()
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || 'Failed to activate product.'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-1 px-4 pt-8 pb-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Vendor Dashboard</h2>
              <p className="mt-1 text-sm text-slate-600">Manage your listings.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/vendor/products/new', { state: { vendorName } })}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                Add product
              </button>
              <button
                onClick={fetchProducts}
                className="rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200"
              >
                Refresh
              </button>
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

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Your listings</h3>
              <p className="text-xs text-slate-600">
                Showing: <span className="font-semibold">{tabs.find((t) => t.key === activeTab)?.label}</span>
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {fetchError ? (
                <div className="bg-red-50 rounded-2xl ring-1 ring-red-200 p-4 text-sm text-red-700">
                  {fetchError}
                  <div className="mt-2 text-xs text-red-700/90">
                    Frontend calls <span className="font-mono">http://localhost:3000/api</span> (see <span className="font-mono">src/api/axios.js</span>). Ensure your product router is mounted at <span className="font-mono">/api/products</span>.
                  </div>
                </div>
              ) : null}

              {loading ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 text-sm text-slate-600">Loading…</div>
              ) : null}

              {!loading && filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 text-sm text-slate-600">
                  No products in this category yet.
                </div>
              ) : null}

              {filteredProducts.map((p) => {
                const meta = statusMeta[p.qrStatus] || statusMeta[STATUS.ACTIVE]
                const isBlocked = p.qrStatus === STATUS.BLOCKED
                const baseText = isBlocked ? 'text-slate-50' : 'text-slate-900'
                const subText = isBlocked ? 'text-slate-200' : 'text-slate-600'

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-5 ${meta.card} ${openActionsForId === p.id ? 'relative z-20' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                          <h4 className={`text-base font-semibold ${baseText}`}>{p.productName}</h4>
                        </div>
                        <p className={`mt-1 text-sm ${subText}`}>
                          <span className="font-semibold">Batch:</span> {p.batchId || '—'}
                          {p.vendorName ? (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-semibold">Vendor:</span> {p.vendorName}
                            </>
                          ) : null}
                        </p>
                        <p className={`mt-1 text-xs ${isBlocked ? 'text-slate-300' : 'text-slate-500'}`}>
                          Added: {formatDateTime(p.createdAt)}
                        </p>
                      </div>

                      <div className="relative" ref={openActionsForId === p.id ? actionsRef : null}>
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                          {meta.label}
                        </div>

                        <button
                          onClick={() => setOpenActionsForId((cur) => (cur === p.id ? null : p.id))}
                          className={
                            isBlocked
                              ? 'mt-2 w-full rounded-xl bg-slate-800 text-slate-50 px-3 py-2 text-xs font-semibold hover:bg-slate-700'
                              : 'mt-2 w-full rounded-xl bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800'
                          }
                        >
                          Actions ▾
                        </button>

                        {openActionsForId === p.id ? (
                          <div
                            className={
                              isBlocked
                                ? 'absolute right-0 top-full mt-2 w-44 rounded-xl bg-slate-900 ring-1 ring-slate-700 shadow-xl overflow-hidden z-50'
                                : 'absolute right-0 top-full mt-2 w-44 rounded-xl bg-white ring-1 ring-slate-200 shadow-xl overflow-hidden z-50'
                            }
                          >
                            <button
                              onClick={() => openDetails(p)}
                              className={
                                isBlocked
                                  ? 'w-full text-left px-4 py-3 text-sm text-slate-50 hover:bg-slate-800'
                                  : 'w-full text-left px-4 py-3 text-sm text-slate-900 hover:bg-slate-50'
                              }
                            >
                              View details
                            </button>

                            {p.qrStatus === STATUS.GENERATED ? (
                              <button
                                onClick={() => onActivate(p)}
                                className={
                                  isBlocked
                                    ? 'w-full text-left px-4 py-3 text-sm text-slate-50 hover:bg-slate-800'
                                    : 'w-full text-left px-4 py-3 text-sm text-slate-900 hover:bg-slate-50'
                                }
                              >
                                Activate
                              </button>
                            ) : null}
                            <button
                              onClick={() => startEdit(p)}
                              className={
                                isBlocked
                                  ? 'w-full text-left px-4 py-3 text-sm text-slate-50 hover:bg-slate-800'
                                  : 'w-full text-left px-4 py-3 text-sm text-slate-900 hover:bg-slate-50'
                              }
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(p)}
                              className={
                                isBlocked
                                  ? 'w-full text-left px-4 py-3 text-sm text-red-200 hover:bg-slate-800'
                                  : 'w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50'
                              }
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VendorPage