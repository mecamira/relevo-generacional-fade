import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/empresas':   'Empresas vendedoras',
  '/compradores':'Compradores e inversores',
  '/matching':   'Sistema de matching',
  '/actas':      'Actas de reunión',
  '/informes':   'Informes',
}

export default function Layout({ children, bannerSlot }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] || 'FADE · Relevo Generacional'

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Storage banner */}
        {bannerSlot}

        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-fade-dark">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:block text-sm text-gray-500">
              Federación Asturiana de Empresarios
            </span>
            <div className="w-8 h-8 rounded-full bg-fade-blue flex items-center justify-center text-white text-sm font-bold">
              F
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
