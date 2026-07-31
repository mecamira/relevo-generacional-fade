import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './utils/auth'
import { DataProvider, useData } from './store/DataContext'
import { isSupabaseConfigured } from './utils/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Empresas from './pages/Empresas'
import Compradores from './pages/Compradores'
import Matching from './pages/Matching'
import Actas from './pages/Actas'
import Informes from './pages/Informes'

function RequireAuth({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return children
}

function StorageBanner() {
  const { error } = useData()
  if (!error && isSupabaseConfigured) return null
  return (
    <div className={`px-4 py-2 text-xs font-medium text-center ${error ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>
      {error
        ? `⚠️ ${error}`
        : '⚠️ Supabase no configurado — los datos se guardan solo en este navegador. Configura las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para persistencia en la nube.'}
    </div>
  )
}

function AuthenticatedApp() {
  return (
    <DataProvider>
      <Layout bannerSlot={<StorageBanner />}>
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/empresas"    element={<Empresas />} />
          <Route path="/compradores" element={<Compradores />} />
          <Route path="/matching"    element={<Matching />} />
          <Route path="/actas"       element={<Actas />} />
          <Route path="/informes"    element={<Informes />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </DataProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <RequireAuth>
              <AuthenticatedApp />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
