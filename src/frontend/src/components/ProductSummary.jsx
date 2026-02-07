import React, { useMemo } from 'react'
import { pickFirst, formatDate, formatDateTime } from '../utils/productHelpers'

const ProductSummary = ({ product }) => {
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

    if (!product) return null

    return (
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
        </div>
    )
}

export default ProductSummary
