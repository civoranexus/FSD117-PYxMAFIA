import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient, { getApiErrorMessage } from '../api/axios.js'

const PRODUCT_BASE = '/products'

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

const safeText = (value) => {
  if (value === null || value === undefined) return '—'
  const s = String(value)
  return s.trim() ? s : '—'
}

const confirmRegenerate = () => {
  return new Promise((resolve) => {
    toast.custom(
      (t) => (
        <div className="w-[360px] rounded-2xl bg-white ring-1 ring-slate-200 shadow-xl p-4">
          <div className="text-sm font-semibold text-slate-900">Regenerate QR Code?</div>
          <div className="mt-2 text-sm text-slate-700">
            Regenerating will make <span className="font-semibold">all previous QR codes</span> for this product invalid.
          </div>
          <div className="mt-1 text-xs text-slate-500">Did you still want to proceed?</div>
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
              className="rounded-xl bg-red-600 text-white px-3 py-2 text-xs font-semibold hover:bg-red-700"
            >
              Regenerate
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    )
  })
}

const downloadUrl = async (url, filename) => {
  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) throw new Error('Failed to download QR image')
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = objectUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()

  URL.revokeObjectURL(objectUrl)
}

const VendorProductDetailsPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')
  const [product, setProduct] = useState(null)
  const [auditLogs, setAuditLogs] = useState([])

  const productId = useMemo(() => (typeof id === 'string' ? id : ''), [id])

  useEffect(() => {
    if (!productId) return

    let cancelled = false
    setLoading(true)
    setError('')

    apiClient
      .get(`/products/vendor/product/${encodeURIComponent(productId)}`)
      .then((res) => {
        if (cancelled) return
        const data = res?.data
        setProduct(data?.product || null)
        setAuditLogs(Array.isArray(data?.auditLogs) ? data.auditLogs : [])
      })
      .catch((e) => {
        if (cancelled) return
        const message = getApiErrorMessage(e, 'Unable to load product details.')
        setError(message)
        toast.error(message)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [productId])

  const refresh = () => {
    if (!productId) return
    setLoading(true)
    setError('')

    apiClient
      .get(`${PRODUCT_BASE}/vendor/product/${encodeURIComponent(productId)}`)
      .then((res) => {
        const data = res?.data
        setProduct(data?.product || null)
        setAuditLogs(Array.isArray(data?.auditLogs) ? data.auditLogs : [])
      })
      .catch((e) => {
        const message = getApiErrorMessage(e, 'Unable to load product details.')
        setError(message)
        toast.error(message)
      })
      .finally(() => setLoading(false))
  }

  const onDownloadQr = async () => {
    const url = product?.qrImageUrl
    if (!url) {
      toast.error('QR image not available.')
      return
    }

    try {
      const safeName = String(product?.productName || 'product').replace(/[^a-z0-9-_]+/gi, '_')
      await downloadUrl(url, `${safeName}_QR.png`)
      toast.success('Downloaded QR image')
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
      toast('Opened QR image in a new tab')
    }
  }

  const onRegenerateQr = async () => {
    if (!productId) return
    const ok = await confirmRegenerate()
    if (!ok) return

    setRegenerating(true)
    try {
      const res = await apiClient.post(`${PRODUCT_BASE}/regenerate-qr/${encodeURIComponent(productId)}`)
      const message = res?.data?.message || 'QR code regenerated'
      toast.success(message)
      // Refresh product + audits to show the new QR image/token
      refresh()
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Failed to regenerate QR code.'))
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-1 px-4 pt-8 pb-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Product details</h2>
              <p className="mt-1 text-sm text-slate-600">View QR code, download it, regenerate it, and check audits.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/vendor-dashboard')}
                className="rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200"
              >
                Back
              </button>
              <button
                onClick={refresh}
                className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-6 bg-white rounded-2xl ring-1 ring-slate-200 p-6 text-sm text-slate-600">Loading…</div>
          ) : null}

          {error ? (
            <div className="mt-6 bg-red-50 rounded-2xl ring-1 ring-red-200 p-4 text-sm text-red-700">{error}</div>
          ) : null}

          {!loading && !error && !product ? (
            <div className="mt-6 bg-white rounded-2xl ring-1 ring-slate-200 p-6 text-sm text-slate-600">No product found.</div>
          ) : null}

          {product ? (
            <>
              <section className="mt-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{safeText(product?.productName)}</h3>
                    <p className="mt-1 text-sm text-slate-600">Vendor: <span className="font-semibold">{safeText(product?.vendorName)}</span></p>
                    <p className="mt-1 text-xs text-slate-500">Created: {formatDateTime(product?.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={onDownloadQr}
                      className="rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200 disabled:opacity-60"
                      disabled={!product?.qrImageUrl}
                    >
                      Download QR
                    </button>
                    <button
                      onClick={onRegenerateQr}
                      className="rounded-xl bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                      disabled={regenerating}
                    >
                      {regenerating ? 'Regenerating…' : 'Regenerate QR'}
                    </button>
                    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-800 ring-1 ring-slate-200">
                      Status: {safeText(product?.qrStatus)}
                    </span>
                    {product?.isSuspicious ? (
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-red-100 text-red-700 ring-1 ring-red-200">
                        Suspicious
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4">
                  <div className="text-sm font-semibold text-amber-900">Important</div>
                  <div className="mt-1 text-sm text-amber-900/90">
                    If you regenerate the QR code, <span className="font-semibold">all previous QR codes</span> for this product become invalid.
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-600">Batch</div>
                    <div className="mt-1 text-sm font-semibold text-slate-900">{safeText(product?.batchId)}</div>
                    <div className="mt-3 text-xs font-semibold text-slate-600">Category</div>
                    <div className="mt-1 text-sm text-slate-900">{safeText(product?.category)}</div>
                    <div className="mt-3 text-xs font-semibold text-slate-600">Price</div>
                    <div className="mt-1 text-sm text-slate-900">{safeText(product?.price)}</div>
                    <div className="mt-3 text-xs font-semibold text-slate-600">Stock</div>
                    <div className="mt-1 text-sm text-slate-900">{safeText(product?.stock)}</div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-600">Manufacture date</div>
                    <div className="mt-1 text-sm text-slate-900">{formatDateTime(product?.manufactureDate) || '—'}</div>
                    <div className="mt-3 text-xs font-semibold text-slate-600">Expiry date</div>
                    <div className="mt-1 text-sm text-slate-900">{formatDateTime(product?.expiryDate) || '—'}</div>
                    <div className="mt-3 text-xs font-semibold text-slate-600">Verification count</div>
                    <div className="mt-1 text-sm text-slate-900">{safeText(product?.verificationCount)}</div>
                    <div className="mt-3 text-xs font-semibold text-slate-600">Last verified</div>
                    <div className="mt-1 text-sm text-slate-900">{formatDateTime(product?.lastVerifiedAt) || '—'}</div>
                  </div>

                  <div className="sm:col-span-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
                    <div className="text-xs font-semibold text-slate-600">Description</div>
                    <div className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{safeText(product?.description)}</div>
                  </div>

                  <div className="sm:col-span-2 rounded-2xl bg-white ring-1 ring-slate-200 p-4">
                    <div className="text-sm font-semibold text-slate-900">QR Code</div>
                    {!product?.qrImageUrl ? (
                      <div className="mt-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-6 text-sm text-slate-600">QR image not available.</div>
                    ) : (
                      <div className="mt-3 rounded-2xl bg-white ring-1 ring-slate-200 p-4 flex items-center justify-center">
                        <img src={product.qrImageUrl} alt="Product QR" className="max-h-[360px] w-auto" loading="lazy" />
                      </div>
                    )}

                    {product?.qrCode ? (
                      <div className="mt-3 text-xs text-slate-600">
                        Token: <span className="font-mono">{String(product.qrCode).slice(0, 16)}…</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Audit logs</h3>
                  <p className="text-xs text-slate-600">Total: <span className="font-semibold">{auditLogs.length}</span></p>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="text-left font-semibold p-3">Time</th>
                        <th className="text-left font-semibold p-3">Result</th>
                        <th className="text-left font-semibold p-3">Location</th>
                        <th className="text-left font-semibold p-3">IP</th>
                        <th className="text-left font-semibold p-3">User agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr className="border-t border-slate-100">
                          <td colSpan={5} className="p-4 text-slate-600">No audit logs yet.</td>
                        </tr>
                      ) : (
                        auditLogs.map((l) => (
                          <tr key={l._id} className="border-t border-slate-100">
                            <td className="p-3 text-slate-600">{formatDateTime(l?.scannedAt)}</td>
                            <td className="p-3 text-slate-900 font-semibold">{safeText(l?.scanResult)}</td>
                            <td className="p-3 text-slate-700">{safeText(l?.location)}</td>
                            <td className="p-3 text-slate-700">{safeText(l?.ipAddress)}</td>
                            <td className="p-3 text-slate-600">{safeText(l?.userAgent)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export default VendorProductDetailsPage
