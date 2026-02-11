import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient, { getApiErrorMessage } from '../api/axios.js'
import toast from 'react-hot-toast'

import { useProductVerification } from '../hooks/useProductVerification'
import { normalizeResponse, isPlainObject, pickFirst } from '../utils/productHelpers'

import ProductSummary from '../components/ProductSummary'
import AuditLogList from '../components/AuditLogList'
import ReportFakeModal from '../components/ReportFakeModal'

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
  Expired: {
    page: 'bg-rose-50',
    badge: 'bg-rose-100 text-rose-900 ring-1 ring-rose-200',
    dot: 'bg-rose-500',
    label: 'Expired',
  },
  Unknown: {
    page: 'bg-slate-50',
    badge: 'bg-slate-100 text-slate-900 ring-1 ring-slate-200',
    dot: 'bg-slate-400',
    label: 'Unknown',
  },
}

const ProductPage = () => {
  const navigate = useNavigate()

  // 1. Data Fetching via Hook
  const { rawResult, fetchingResult, fetchError } = useProductVerification()
  const response = useMemo(() => normalizeResponse(rawResult), [rawResult])

  // 2. Logic to derive Product Object
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

  // 3. Logic to derive Status
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
    if (['Valid', 'Invalid', 'AlreadyUsed', 'Blocked', 'Expired'].includes(s)) return s

    // If backend didn't provide status, infer expiry.
    const expiry = product?.expiryDate ? new Date(product.expiryDate) : null
    if (expiry && !Number.isNaN(expiry.getTime()) && Date.now() > expiry.getTime()) return 'Expired'

    // Fallback: infer from product.qrStatus
    const qrStatus = typeof product?.qrStatus === 'string' ? product.qrStatus : ''
    if (qrStatus === 'blocked') return 'Blocked'
    if (qrStatus === 'used') return 'AlreadyUsed'
    return 'Unknown'
  }, [scanStatusRaw, product])

  const styleKey = useMemo(() => {
    if (scanStatus === 'Blocked') return 'Blocked'
    if (scanStatus === 'Expired') return 'Expired'
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

  // 4. Audit Log Fetching (Component-specific logic kept here to pass to child)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    const t = setTimeout(() => {
      if (cancelled) return
      setAuditLoading(true)
      apiClient
        .get(`/audit/public/product/${encodeURIComponent(productId)}?limit=6`)
        .then((res) => {
          if (cancelled) return
          const list = Array.isArray(res.data) ? res.data : []
          setAuditLogs(list)
        })
        .catch((err) => {
          if (cancelled) return
          setAuditLogs([])
          const message = getApiErrorMessage(err, 'Unable to load verification history.')
          toast.error(message)
        })
        .finally(() => {
          if (cancelled) return
          setAuditLoading(false)
        })
    }, 0)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [productId])

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
              <ProductSummary product={product} />
              <AuditLogList logs={auditLogs} loading={auditLoading} />
              <ReportFakeModal productId={productId} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProductPage