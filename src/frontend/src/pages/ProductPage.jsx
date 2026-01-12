import React, { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar.jsx'

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

const normalizePayload = (payload) => {
  if (!payload) return payload
  if (isPlainObject(payload)) {
    const nested = pickFirst(payload, ['data', 'product', 'result', 'payload'])
    if (nested !== undefined) return nested
  }
  return payload
}

const deriveVerification = (payload) => {
  if (!isPlainObject(payload)) {
    return {
      tone: 'neutral',
      title: 'Verification result',
      subtitle: 'Details below.',
    }
  }

  const bool = (value) => (typeof value === 'boolean' ? value : undefined)
  const statusBool =
    bool(pickFirst(payload, ['valid', 'verified', 'isValid', 'isVerified', 'authentic', 'isAuthentic', 'genuine', 'isGenuine', 'success']))

  const statusText = pickFirst(payload, ['status', 'verificationStatus'])
  const message = pickFirst(payload, ['message', 'detail', 'reason', 'error'])

  if (statusBool === true) {
    return {
      tone: 'success',
      title: 'Verified',
      subtitle: message ? String(message) : 'This product appears authentic.',
    }
  }
  if (statusBool === false) {
    return {
      tone: 'danger',
      title: 'Not verified',
      subtitle: message ? String(message) : 'We could not verify this product.',
    }
  }

  if (typeof statusText === 'string') {
    const normalized = statusText.toLowerCase()
    if (['valid', 'verified', 'authentic', 'genuine', 'ok', 'success'].some((s) => normalized.includes(s))) {
      return {
        tone: 'success',
        title: 'Verified',
        subtitle: message ? String(message) : `Status: ${statusText}`,
      }
    }
    if (['invalid', 'fake', 'counterfeit', 'failed', 'not verified', 'unverified'].some((s) => normalized.includes(s))) {
      return {
        tone: 'danger',
        title: 'Not verified',
        subtitle: message ? String(message) : `Status: ${statusText}`,
      }
    }
  }

  return {
    tone: 'neutral',
    title: 'Verification result',
    subtitle: message ? String(message) : 'Review the details below.',
  }
}

const toneStyles = {
  success: {
    container: 'bg-emerald-50 ring-1 ring-emerald-200',
    title: 'text-emerald-900',
    subtitle: 'text-emerald-800',
    dot: 'bg-emerald-500',
  },
  danger: {
    container: 'bg-red-50 ring-1 ring-red-200',
    title: 'text-red-900',
    subtitle: 'text-red-800',
    dot: 'bg-red-500',
  },
  neutral: {
    container: 'bg-slate-50 ring-1 ring-slate-200',
    title: 'text-slate-900',
    subtitle: 'text-slate-700',
    dot: 'bg-slate-400',
  },
}

const ProductPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)

  const qr = location?.state?.qr
  const productResult = useMemo(
    () => normalizePayload(location?.state?.productResult),
    [location?.state?.productResult]
  )

  const verification = useMemo(
    () => deriveVerification(isPlainObject(productResult) ? productResult : location?.state?.productResult),
    [productResult, location?.state?.productResult]
  )

  const hasData = productResult !== undefined && productResult !== null

  const renderKeyValueGrid = (obj) => {
    const entries = Object.entries(obj)
      .filter(([, v]) => typeof v !== 'object')
      .slice(0, 12)

    if (entries.length === 0) return null

    return (
      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {entries.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
            <dt className="text-xs font-semibold text-slate-600">{formatLabel(k)}</dt>
            <dd className="mt-1 text-sm text-slate-900 wrap-break-word">{String(v)}</dd>
          </div>
        ))}
      </dl>
    )
  }

  const mainFields = useMemo(() => {
    if (!isPlainObject(productResult)) return []

    const get = (keys) => pickFirst(productResult, keys)

    const candidates = [
      { label: 'Product name', value: get(['name', 'productName', 'title']) },
      { label: 'Brand', value: get(['brand', 'brandName']) },
      { label: 'Manufacturer', value: get(['manufacturer', 'maker', 'producer']) },
      { label: 'Vendor', value: get(['vendor', 'vendorName', 'seller']) },
      { label: 'Batch / Lot', value: get(['batch', 'batchNo', 'batchNumber', 'lot', 'lotNo', 'lotNumber']) },
      { label: 'Serial', value: get(['serial', 'serialNo', 'serialNumber', 'qrCode', 'code']) },
      { label: 'Manufactured', value: get(['mfgDate', 'manufacturedAt', 'manufacturedOn', 'manufactureDate']) },
      { label: 'Expiry', value: get(['expDate', 'expiryDate', 'expiresAt', 'expiresOn']) },
      { label: 'Country', value: get(['country', 'countryOfOrigin', 'originCountry']) },
    ]

    return candidates
      .filter((f) => f.value !== undefined && f.value !== null && String(f.value).trim() !== '')
      .slice(0, 8)
  }, [productResult])

  const onCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(productResult, null, 2))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-1 px-4 pt-10 pb-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Product Verification</h2>
              <p className="mt-2 text-sm text-slate-600">
                {qr ? (
                  <span>QR: <span className="font-mono text-xs bg-white ring-1 ring-slate-200 rounded-md px-2 py-1">{qr}</span></span>
                ) : (
                  <span>Scan a QR code to see verification details.</span>
                )}
              </p>
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
              <p className="text-slate-700 text-sm">
                No verification data was provided. This can happen if you refreshed the page or opened it directly.
              </p>
              <p className="mt-3 text-slate-600 text-sm">
                Go back and scan the QR code again.
              </p>
            </div>
          ) : (
            <>
              <div className={`mt-6 rounded-2xl p-5 ${toneStyles[verification.tone].container}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-3 w-3 rounded-full ${toneStyles[verification.tone].dot}`} />
                  <div>
                    <h3 className={`text-sm font-semibold ${toneStyles[verification.tone].title}`}>{verification.title}</h3>
                    <p className={`mt-1 text-sm ${toneStyles[verification.tone].subtitle}`}>{verification.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-slate-900">Summary</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowRaw((v) => !v)}
                      className="rounded-xl bg-slate-100 text-slate-900 px-3 py-2 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                    >
                      {showRaw ? 'Hide raw' : 'Show raw'}
                    </button>
                    <button
                      onClick={onCopyJson}
                      className="rounded-xl bg-black text-white px-3 py-2 text-xs font-semibold hover:bg-slate-900 cursor-pointer"
                    >
                      {copied ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                </div>

                {mainFields.length > 0 ? (
                  <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {mainFields.map((field) => (
                      <div key={field.label} className="rounded-xl bg-slate-50 ring-1 ring-slate-200 p-3">
                        <dt className="text-xs font-semibold text-slate-600">{field.label}</dt>
                        <dd className="mt-1 text-sm text-slate-900 wrap-break-word">{String(field.value)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : isPlainObject(productResult) ? (
                  renderKeyValueGrid(productResult)
                ) : (
                  <p className="mt-3 text-sm text-slate-600">No summary fields available.</p>
                )}

                {showRaw ? (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-slate-600">Raw JSON</h4>
                    <pre className="mt-2 text-xs bg-slate-950 text-slate-50 rounded-xl p-4 overflow-auto">
                      {JSON.stringify(productResult, null, 2)}
                    </pre>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProductPage