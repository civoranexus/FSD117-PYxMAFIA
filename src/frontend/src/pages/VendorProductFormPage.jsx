import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar.jsx'
import apiClient from '../api/axios.js'
import toast from 'react-hot-toast'

const STATUS = {
  GENERATED: 'generated',
  ACTIVE: 'active',
  USED: 'used',
  BLOCKED: 'blocked',
}

const toDateInputValue = (value) => {
  if (!value) return ''
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

const PRODUCT_BASE = '/products'

const generateBatchId = () => {
  const letters = Array.from({ length: 4 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('')
  const digits = String(Math.floor(1000 + Math.random() * 9000))
  return `${letters}-${digits}`
}

const normalizeVendorName = (value) => {
  if (typeof value !== 'string') return ''
  const v = value.trim()
  if (!v) return ''
  // Guard against accidental stringification of objects/promises
  if (v === '[object Promise]' || v === '[object Object]') return ''
  return v
}

const VendorProductFormPage = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [vendorNameFromApi, setVendorNameFromApi] = useState('')

  const vendorNameFixed = useMemo(() => {
    const fromState = normalizeVendorName(location?.state?.vendorName)
    const fromStorage = normalizeVendorName(window.localStorage.getItem('vendorName'))
    const fromApi = normalizeVendorName(vendorNameFromApi)
    return fromState || fromStorage || fromApi || ''
  }, [location?.state?.vendorName, vendorNameFromApi])

  const initial = useMemo(() => {
    const p = location?.state?.product
    return {
      productName: p?.productName ?? p?.name ?? '',
      description: p?.description ?? '',
      price: p?.price ?? '',
      category: p?.category ?? '',
      stock: p?.stock ?? '',
      batchId: p?.batchId ?? p?.batchNo ?? '',
      manufactureDate: toDateInputValue(p?.manufactureDate ?? p?.manufacturedAt ?? p?.mfgDate),
      expiryDate: toDateInputValue(p?.expiryDate ?? p?.expiresAt ?? p?.expDate),
      vendorName: p?.vendorName ?? vendorNameFixed ?? '',
      // Backend enum: generated|active|used|blocked
      qrStatus: p?.qrStatus ?? p?.status ?? (p?.isSuspicious ? STATUS.BLOCKED : STATUS.GENERATED),
      verificationCount: p?.verificationCount ?? 0,
      isSuspicious: p?.isSuspicious ?? false,
    }
  }, [location?.state?.product, vendorNameFixed])

  const mode = location?.state?.mode === 'edit' ? 'edit' : 'create'
  const editingProduct = location?.state?.product

  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    if (!String(form.productName).trim()) return 'Product name is required.'
    if (!String(form.description).trim()) return 'Description is required.'
    if (form.price === '' || Number(form.price) <= 0) return 'Price must be greater than 0.'
    if (!String(form.category).trim()) return 'Category is required.'
    if (form.stock === '' || Number(form.stock) < 0) return 'Stock must be 0 or more.'
    if (!String(form.batchId).trim()) return 'Batch ID is required.'
    if (!String(form.manufactureDate).trim()) return 'Manufacture date is required.'
    if (!String(form.expiryDate).trim()) return 'Expiry date is required.'
    return ''
  }

  useEffect(() => {
    // If vendorName isn't available via navigation state/localStorage, fetch it from backend.
    // This is only for display; backend derives vendorName/vendorId from the auth cookie.
    if (vendorNameFixed) return
    apiClient
      .get(`${PRODUCT_BASE}/vendor/name`)
      .then((res) => {
        const name = normalizeVendorName(res?.data?.vendorName)
        if (!name) return
        setVendorNameFromApi(name)
        window.localStorage.setItem('vendorName', name)
        setForm((prev) => ({ ...prev, vendorName: name }))
      })
      .catch((e) => {
        // Non-fatal; user may not be logged in and create will fail anyway.
        console.warn('[vendor/name fetch failed]', e?.response?.data || e?.message || e)
      })
  }, [vendorNameFixed])

  useEffect(() => {
    // When creating, prefill Batch ID + lock vendorName/qrStatus defaults.
    if (mode === 'create') {
      setForm((prev) => ({
        ...prev,
        vendorName: vendorNameFixed || prev.vendorName,
        // Backend will persist qrStatus as "generated" on create.
        qrStatus: STATUS.GENERATED,
        batchId: prev.batchId || generateBatchId(),
      }))
    }
    // When editing, vendorName and qrStatus are shown but locked.
    if (mode === 'edit') {
      setForm((prev) => ({
        ...prev,
        vendorName: prev.vendorName || vendorNameFixed,
      }))
    }
  }, [mode, vendorNameFixed])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const err = validate()
    if (err) {
      setError(err)
      return
    }

    const payload = {
      productName: String(form.productName).trim(),
      description: String(form.description).trim(),
      price: Number(form.price),
      category: String(form.category).trim(),
      stock: Number(form.stock),
      batchId: String(form.batchId).trim(),
      manufactureDate: form.manufactureDate,
    }

    // Expiry date is immutable after creation.
    if (mode !== 'edit') {
      payload.expiryDate = form.expiryDate
    }

    setSaving(true)
    try {
      if (mode === 'edit') {
        const id = editingProduct?.id ?? editingProduct?._id
        if (!id) {
          throw new Error('Missing product id for edit. Please go back and try again.')
        }
        await apiClient.post(`${PRODUCT_BASE}/update/${encodeURIComponent(id)}`, payload)
        toast.success('Product updated')
      } else {
        await apiClient.post(`${PRODUCT_BASE}/create`, payload)
        toast.success('Product created')
      }

      navigate('/vendor-dashboard', { state: { refresh: true } })
    } catch (e2) {
      console.error('[Product save failed]', {
        mode,
        endpoint: mode === 'edit' ? `${PRODUCT_BASE}/update/${editingProduct?.id ?? editingProduct?._id}` : `${PRODUCT_BASE}/create`,
        payload,
        status: e2?.response?.status,
        data: e2?.response?.data,
        message: e2?.message,
      })
      const message = e2?.response?.data?.message || e2?.message || 'Failed to save product.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavigationBar />

      <main className="flex-1 px-4 pt-8 pb-10">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {mode === 'edit' ? 'Edit product' : 'Add a new product'}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Fill all fields to create a scannable, verifiable product listing.
              </p>
            </div>
            <button
              onClick={() => navigate('/vendor-dashboard')}
              className="rounded-xl bg-slate-100 text-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-200"
            >
              Back
            </button>
          </div>

          <div className="mt-6 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Product name</label>
                <input
                  value={form.productName}
                  onChange={(e) => setField('productName', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="ChocoPure 70% Dark Chocolate 100g"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Rich dark chocolate with no artificial flavors."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Price</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="199"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="Snacks"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setField('stock', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="60"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Manufacture date</label>
                <input
                  type="date"
                  value={form.manufactureDate}
                  onChange={(e) => setField('manufactureDate', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Expiry date</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setField('expiryDate', e.target.value)}
                  disabled={mode === 'edit'}
                  className={
                    mode === 'edit'
                      ? 'mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none opacity-80 cursor-not-allowed'
                      : 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20'
                  }
                />
                <p className="mt-1 text-xs text-slate-500">
                  {mode === 'edit'
                    ? 'Expiry date is locked after creation and cannot be edited.'
                    : 'Expiry date cannot be changed after creation (printed on the QR label).'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Batch ID</label>
                <input
                  value={form.batchId}
                  onChange={(e) => setField('batchId', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  placeholder="CPDC-1125"
                />
                {mode === 'create' ? (
                  <p className="mt-2 text-xs text-slate-500">Auto-generated by default; you can change it if needed.</p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Vendor name</label>
                <input
                  value={vendorNameFixed || form.vendorName}
                  readOnly
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
                //   placeholder="ChocoPure India"
                />
                <p className="mt-2 text-xs text-slate-500">Vendor name is fixed for your account.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">QR status</label>
                <select
                  value={form.qrStatus || STATUS.GENERATED}
                  disabled
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none"
                >
                  <option value={STATUS.GENERATED}>Generated</option>
                  <option value={STATUS.ACTIVE}>Active</option>
                  <option value={STATUS.USED}>Used</option>
                  <option value={STATUS.BLOCKED}>Blocked</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">QR status is controlled by the system.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Verification count</label>
                <input
                  type="number"
                  value={form.verificationCount}
                  onChange={(e) => setField('verificationCount', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/20"
                  min={0}
                />
              </div>

              <div className="flex items-center gap-2 sm:pt-6">
                <input
                  id="isSuspicious"
                  type="checkbox"
                  checked={Boolean(form.isSuspicious)}
                  onChange={(e) => {
                    // Can only be enabled, not disabled.
                    if (form.isSuspicious) return
                    if (e.target.checked) setField('isSuspicious', true)
                  }}
                  disabled={Boolean(form.isSuspicious)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <label htmlFor="isSuspicious" className="text-sm text-slate-700">
                  Mark as suspicious
                </label>
                {form.isSuspicious ? (
                  <span className="ml-2 text-xs text-slate-500">(locked)</span>
                ) : null}
              </div>

              {error ? (
                <div className="sm:col-span-2 rounded-xl bg-red-50 ring-1 ring-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-semibold hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default VendorProductFormPage
