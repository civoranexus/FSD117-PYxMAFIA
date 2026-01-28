import './App.css'
import AppRouter from './routes/AppRouter'
import { useEffect, useRef } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import GlobalLoader from './components/GlobalLoader'
import apiClient from './api/axios'

function App() {
  const didWarmupRef = useRef(false)

  useEffect(() => {
    if (didWarmupRef.current) return
    didWarmupRef.current = true

    const toastId = toast.loading('Website is loading, Please wait…')

    apiClient
      .get('/warmup', { skipGlobalLoader: true, timeout: 15000 })
      .then(() => {
        toast.dismiss(toastId)
        toast.success('Website is back in.')
      })
      .catch(() => {
        toast.dismiss(toastId)
        toast.error('Backend is waking up. Please try again in a moment.')
      })
  }, [])

  return (
    <>
      <GlobalLoader />
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '14px',
            background: '#0f172a',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

export default App
