
export const isPlainObject = (value) => {
    return (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value)
    )
}

export const pickFirst = (obj, keys) => {
    for (const key of keys) {
        if (obj && Object.prototype.hasOwnProperty.call(obj, key)) return obj[key]
    }
    return undefined
}

export const formatDate = (value) => {
    if (!value) return ''
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return ''
    return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(d)
}

export const formatDateTime = (value) => {
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

// Preserve the backend wrapper response shape:
// { status: 'Valid'|'Invalid'|'AlreadyUsed'|'Blocked', suspicious: boolean, product: {...} }
// Only unwrap common wrappers like { data: ... }.
export const normalizeResponse = (value) => {
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
