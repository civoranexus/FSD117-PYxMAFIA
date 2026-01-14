import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient from '../api/axios.js'

const isPlainObject = (value) => {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  )
}

const formatLabel = (key) => {
  if (!key) return ''
  return String(key)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase())
}

const pickFirst = (obj, keys) => {
  for (const key of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) return obj[key]
  }
  return undefined
}

// Preserve the backend wrapper response shape:
// { status: 'Valid'|'Invalid'|'AlreadyUsed'|'Blocked', suspicious: boolean, product: {...} }
// Only unwrap common wrappers like { data: ... }.
const normalizeResponse = (value) => {
  if (!value) return value
  if (!isPlainObject(value)) return value

  if (
    Object.prototype.hasOwnProperty.call(value, 'status') ||
    Object.prototype.hasOwnProperty.call(value, 'product') ||
    Object.prototype.hasOwnProperty.call(value, 'suspicious')
  ) {
    return value
  }

  const nested = pickFirst(value, ['data', 'result', 'payload'])
  return nested !== undefined ? nested : value
}

const statusStyles = {
  Valid: {
    page: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Valid',
  },
  Suspicious: {
    page: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-900 ring-1 ring-orange-200',
    dot: 'bg-orange-500',
    label: 'Suspicious',
  },
  AlreadyUsed: {
    page: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-900 ring-1 ring-amber-200',
    dot: 'bg-amber-500',
    label: 'Already used',
  },
  Blocked: {
    page: 'bg-red-50',
    badge: 'bg-red-100 text-red-900 ring-1 ring-red-200',
    dot: 'bg-red-500',
    label: 'Blocked',
  },
  Invalid: {
    page: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-900 ring-1 ring-slate-200',
    dot: 'bg-slate-500',
    label: 'Invalid',
  },
  Unknown: {
    page: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-900 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    label: 'Unknown',
  },
}

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(d)
}

const formatDateTime = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

const ProductPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [fetchedResult, setFetchedResult] = useState(null)
  const [fetchingResult, setFetchingResult] = useState(false)
  const [fetchError, setFetchError] = useState('')

  const qrFromState = useMemo(() => {
    const qr = location?.state?.qr
    return typeof qr === 'string' ? qr : ''
  }, [location?.state?.qr])

  const qrFromQuery = useMemo(() => {
    const sp = new URLSearchParams(location?.search || '')
    const qr = sp.get('qr') || sp.get('code') || ''
    return typeof qr === 'string' ? qr : ''
  }, [location?.search])

  const qr = qrFromState || qrFromQuery

  const rawResult = useMemo(() => {
    return location?.state?.productResult ?? fetchedResult
  }, [location?.state?.productResult, fetchedResult])

  const response = useMemo(() => normalizeResponse(rawResult), [rawResult])

  useEffect(() => {
    // If someone refreshes /product, React Router state is lost.
    // We fall back to fetching by qr query param so the details still render.
    if (!qr) return
    if (location?.state?.productResult) return
    if (fetchedResult) return

    setFetchError('')
    setFetchingResult(true)
    apiClient
      .get(`/products/${encodeURIComponent(qr)}`)
      .then((res) => {
        setFetchedResult(res?.data)
      })
      .catch((err) => {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Unable to load product details. Please rescan the QR.'
        setFetchError(message)
      })
      .finally(() => {
        setFetchingResult(false)
      })
  }, [qr, location?.state?.productResult, fetchedResult])

  const product = useMemo(() => {
    if (!isPlainObject(response)) return undefined

    const p = pickFirst(response, ['product', 'item'])
    if (isPlainObject(p)) return p

    // Sometimes the response might already be the product object.
    if (
      Object.prototype.hasOwnProperty.call(response, 'productName') ||
      Object.prototype.hasOwnProperty.call(response, 'vendorName') ||
      Object.prototype.hasOwnProperty.call(response, 'batchId')
    ) {
      return response
    }

    return undefined
  }, [response])

  const suspicious = useMemo(() => {
    if (isPlainObject(response) && typeof response.suspicious === 'boolean') return response.suspicious
    if (product && typeof product.isSuspicious === 'boolean') return product.isSuspicious
    if (isPlainObject(response) && typeof response.isSuspicious === 'boolean') return response.isSuspicious
    return false
  }, [response, product])

  const scanStatusRaw = useMemo(() => {
    if (isPlainObject(response)) return pickFirst(response, ['status', 'scanResult', 'verificationStatus'])
    return undefined
  }, [response])

  const scanStatus = useMemo(() => {
    const s = typeof scanStatusRaw === 'string' ? scanStatusRaw : ''
    if (['Valid', 'Invalid', 'AlreadyUsed', 'Blocked'].includes(s)) return s
    // Fallback: infer from product.qrStatus
    const qrStatus = typeof product?.qrStatus === 'string' ? product.qrStatus : ''
    if (qrStatus === 'blocked') return 'Blocked'
    if (qrStatus === 'used') return 'AlreadyUsed'
    return 'Unknown'
  }, [scanStatusRaw, product])

  const styleKey = useMemo(() => {
    if (scanStatus === 'Blocked') return 'Blocked'
    if (scanStatus === 'Invalid') return 'Invalid'
    if (suspicious) return 'Suspicious'
    if (scanStatus === 'AlreadyUsed') return 'AlreadyUsed'
    if (scanStatus === 'Valid') return 'Valid'
    return 'Unknown'
  }, [scanStatus, suspicious])

  const style = statusStyles[styleKey] || statusStyles.Unknown

  const productId = useMemo(() => {
    const id = product?._id || product?.id || (isPlainObject(response) ? pickFirst(response, ['productId', '_id', 'id']) : undefined)
    return typeof id === 'string' ? id : id?.toString?.()
  }, [product, response])

  const hasData = Boolean(product)

  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)

  useEffect(() => {
    if (!productId) return
    setAuditLoading(true)
    apiClient
      .get(`/audit/public/product/${encodeURIComponent(productId)}?limit=6`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : []
        setAuditLogs(list)
      })
      .catch(() => {
        setAuditLogs([])
      })
      .finally(() => {
        setAuditLoading(false)
      })
  }, [productId])

  const mainFields = useMemo(() => {
    if (!product) return []
    const get = (keys) => pickFirst(product, keys)

    const candidates = [
      { label: 'Product name', value: get(['productName', 'name', 'title']) },
      { label: 'Vendor', value: get(['vendorName', 'vendor', 'seller']) },
      { label: 'Description', value: get(['description', 'details']) },
      { label: 'Category', value: get(['category']) },
      { label: 'Price', value: get(['price']) },
      { label: 'Stock', value: get(['stock']) },
      { label: 'Batch ID', value: get(['batchId', 'batchNo', 'batchNumber']) },
      { label: 'Manufacture date', value: formatDate(get(['manufactureDate', 'manufacturedAt', 'mfgDate'])) },
      { label: 'Expiry date', value: formatDate(get(['expiryDate', 'expiresAt', 'expDate'])) },
      { label: 'Views', value: get(['verificationCount', 'views', 'viewCount']) },
      { label: 'Last verified', value: formatDateTime(get(['lastVerifiedAt', 'lastScanAt', 'lastSeenAt'])) },
    ]

    return candidates
      .filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== '')
  }, [product])

  return (
    <div className={`min-h-screen ${style.page} flex flex-col`}>
      <NavigationBar />

      <main className="flex-1 px-4 pt-10 pb-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Product Details</h2>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold bg-white/70 ring-1 ring-slate-200">
                <span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />
                <span className="text-slate-900">Status:</span>
                <span className={`rounded-full px-2 py-0.5 ${style.badge}`}>{style.label}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="shrink-0 rounded-xl bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer"
            >
              Back to Scan
            </button>
          </div>

          {!hasData ? (
            <div className="mt-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
              {fetchingResult ? (
                <p className="text-slate-700 text-sm">Loading product details…</p>
              ) : (
                <p className="text-slate-700 text-sm">No product details were provided.</p>
              )}

              {fetchError ? (
                <p className="mt-3 text-sm text-red-600">{fetchError}</p>
              ) : (
                <p className="mt-3 text-slate-600 text-sm">Go back and scan the QR code again.</p>
              )}
            </div>
          ) : (
            <>
              <div className="mt-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900">Summary</h3>

                {mainFields.length > 0 ? (
                  <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {mainFields.map((field) => (
                      <div key={field.label} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                        <dt className="text-xs font-semibold text-slate-600">{field.label}</dt>
                        <dd className="mt-1 text-sm text-slate-900 wrap-break-word">{String(field.value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-slate-600">No summary fields available.</p>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">Recent scans</h3>
                    {auditLoading ? <span className="text-xs text-slate-500">Loading…</span> : null}
                  </div>

                  {!auditLoading && auditLogs.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">No scan history available.</p>
                  ) : null}

                  {auditLogs.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {auditLogs.map((log) => (
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
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProductPage