import './App.css'
import AppRouter from './routes/AppRouter'
import { Toaster } from 'react-hot-toast'
import GlobalLoader from './components/GlobalLoader'

function App() {
  
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
