import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/auth'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const ok = login(form.username.trim(), form.password)
      if (ok) {
        navigate('/')
      } else {
        setError('Usuario o contraseña incorrectos.')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="min-h-screen bg-fade-dark flex flex-col items-center justify-center px-4">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-fade-blue/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fade-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="text-5xl font-black tracking-widest text-white">FADE</p>
          <p className="text-fade-gold text-sm font-semibold tracking-widest uppercase mt-1">
            Relevo Generacional
          </p>
          <p className="text-white/40 text-xs mt-3">Federación Asturiana de Empresarios</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-fade-dark mb-6">Acceso privado</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                autoComplete="username"
                required
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fade-blue focus:border-transparent text-sm"
                placeholder="Usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fade-blue focus:border-transparent text-sm"
                placeholder="Contraseña"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-fade-dark hover:bg-fade-mid text-white font-semibold rounded-lg transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Acceso restringido. Uso exclusivo interno.
          </p>
        </div>
      </div>
    </div>
  )
}
