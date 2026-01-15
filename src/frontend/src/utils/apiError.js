// Centralized API error message extraction for axios/fetch errors.
// Keeps UI messaging consistent across pages.

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  // Axios-style error
  const data = error?.response?.data

  if (typeof data === 'string' && data.trim()) return data

  const messageFromData =
    data?.message ||
    data?.error ||
    data?.msg ||
    data?.details?.message ||
    (Array.isArray(data?.errors) ? data.errors.map((e) => e?.message || e).filter(Boolean).join(', ') : '')

  if (typeof messageFromData === 'string' && messageFromData.trim()) return messageFromData

  if (typeof error?.message === 'string' && error.message.trim()) return error.message

  // Axios network errors sometimes show a generic message
  if (error?.code === 'ERR_NETWORK') return 'Network error. Is the backend running?'

  return fallback
}
