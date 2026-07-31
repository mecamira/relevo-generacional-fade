import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { useData } from '../store/DataContext'
import { autoMatches, scoreLabel } from '../utils/matching'
import { ESTADOS_EMPRESA } from '../utils/constants'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'

const COLORS = ['#0055B8', '#003F8A', '#D4A017', '#6366f1', '#10b981', '#6b7280']

export default function Dashboard() {
  const { empresas, compradores, matches, loading } = useData()
  const suggestions = useMemo(() => autoMatches(empresas, compradores), [empresas, compradores])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <svg className="animate-spin w-8 h-8 mr-3 text-fade-blue" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      Cargando datos…
    </div>
  )

  // KPIs
  const enProceso = empresas.filter(e => e.estado === 'en_proceso').length
  const cerradas  = empresas.filter(e => e.estado === 'cerrado_exito').length
  const activeCompradores = compradores.filter(c => c.estado === 'activo').length
  const activeMatches = matches.filter(m => !['descartado'].includes(m.estadoMatch)).length

  // Chart: empresas por estado
  const estadoData = ESTADOS_EMPRESA.map(({ value, label }) => ({
    name: label,
    count: empresas.filter(e => e.estado === value).length,
  })).filter(d => d.count > 0)

  // Chart: compradores por tipo
  const TIPOS = ['pe', 'family_office', 'industrial', 'mbo', 'privado', 'otro']
  const TIPO_LABELS = {
    pe: 'Private Equity', family_office: 'Family Office', industrial: 'Industrial',
    mbo: 'MBO', privado: 'Privado', otro: 'Otro',
  }
  const tipoData = TIPOS
    .map(t => ({ name: TIPO_LABELS[t], value: compradores.filter(c => c.tipo === t).length }))
    .filter(d => d.value > 0)

  // Recent empresas
  const recentEmpresas = [...empresas]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  // Top suggestions
  const topSuggestions = suggestions.slice(0, 5).map(s => ({
    ...s,
    empresa: empresas.find(e => e.id === s.empresaId),
    comprador: compradores.find(c => c.id === s.compradorId),
  })).filter(s => s.empresa && s.comprador)

  const fmtEur = (n) => n ? `${Number(n).toLocaleString('es-ES')} k€` : '—'
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '—'

  const getEmpresaLabel = (estado) => ESTADOS_EMPRESA.find(e => e.value === estado) || { label: estado, color: 'gray' }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Empresas en cartera"
          value={empresas.length}
          sub={`${enProceso} en proceso`}
          icon="🏢"
          accent
        />
        <StatCard
          label="Compradores activos"
          value={activeCompradores}
          sub={`${compradores.length} en total`}
          icon="🤝"
        />
        <StatCard
          label="Matches activos"
          value={activeMatches}
          sub={`${suggestions.length} sugerencias auto`}
          icon="🔗"
        />
        <StatCard
          label="Operaciones cerradas"
          value={cerradas}
          sub="con éxito"
          icon="✅"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Empresas por estado */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Empresas por estado
          </h2>
          {estadoData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={estadoData} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, 'Empresas']} />
                <Bar dataKey="count" fill="#0055B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Compradores por tipo */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Compradores por tipo
          </h2>
          {tipoData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={tipoData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {tipoData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent empresas */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Últimas empresas añadidas
            </h2>
            <Link to="/empresas" className="text-xs text-fade-blue hover:underline font-medium">
              Ver todas →
            </Link>
          </div>
          {recentEmpresas.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin empresas todavía</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentEmpresas.map(e => {
                const st = getEmpresaLabel(e.estado)
                return (
                  <li key={e.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{e.nombre}</p>
                      <p className="text-xs text-gray-400">{e.sector} · {e.provincia}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{fmtDate(e.createdAt)}</span>
                      <Badge label={st.label} color={st.color} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Top matches */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Top matches sugeridos
            </h2>
            <Link to="/matching" className="text-xs text-fade-blue hover:underline font-medium">
              Ver todos →
            </Link>
          </div>
          {topSuggestions.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">
              Añade empresas y compradores para ver sugerencias automáticas
            </p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {topSuggestions.map((s, i) => {
                const sl = scoreLabel(s.score)
                return (
                  <li key={i} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {s.empresa.nombre}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        ↔ {s.comprador.nombre}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-fade-dark">{s.score}%</span>
                      <Badge label={sl.label} color={sl.color} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
