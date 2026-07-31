import { useState, useMemo } from 'react'
import { useData } from '../store/DataContext'
import {
  ESTADOS_EMPRESA, SECTORES, PROVINCIAS,
  MOTIVOS_VENTA, PORCENTAJES_VENTA,
} from '../utils/constants'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ContactosEditor from '../components/ContactosEditor'

// ── Shared form primitives (MUST be outside any component to avoid focus loss) ──

function Field({ label, required, col, children }) {
  return (
    <div className={col}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fade-blue focus:border-transparent text-sm'
const sel = inp + ' bg-white'

// ── Historical financials mini-editor ─────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

function HistoricoEditor({ value = [], onChange }) {
  const [newYear, setNewYear] = useState(String(CURRENT_YEAR))

  const rows = [...value].sort((a, b) => b.year - a.year)

  function addYear() {
    const y = Number(newYear)
    if (value.find(r => r.year === y)) return
    onChange([...value, { year: y, facturacion: '', ebitda: '', plantilla: '', estimativo: false }])
  }

  function updateRow(year, field, val) {
    onChange(value.map(r => r.year === year ? { ...r, [field]: val } : r))
  }

  function removeRow(year) {
    onChange(value.filter(r => r.year !== year))
  }

  const usedYears = new Set(value.map(r => r.year))

  return (
    <div className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Añade ejercicios con el botón inferior para registrar el histórico financiero.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left font-semibold text-gray-500 border border-gray-200 whitespace-nowrap">Ejercicio</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-500 border border-gray-200 whitespace-nowrap">Facturación (k€)</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-500 border border-gray-200 whitespace-nowrap">EBITDA (k€)</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-500 border border-gray-200 whitespace-nowrap">Margen</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-500 border border-gray-200 whitespace-nowrap">Plantilla</th>
                <th className="px-3 py-2 text-center font-semibold text-gray-500 border border-gray-200 whitespace-nowrap">Estimativo</th>
                <th className="px-2 py-2 border border-gray-200"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => {
                const margen = r.facturacion && r.ebitda
                  ? ((Number(r.ebitda) / Number(r.facturacion)) * 100).toFixed(1) + '%'
                  : '—'
                return (
                  <tr key={r.year} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 border border-gray-200 font-bold text-fade-dark">{r.year}</td>
                    <td className="px-2 py-1 border border-gray-200">
                      <input
                        type="number" min="0"
                        value={r.facturacion}
                        onChange={e => updateRow(r.year, 'facturacion', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-fade-blue text-xs"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-2 py-1 border border-gray-200">
                      <input
                        type="number"
                        value={r.ebitda}
                        onChange={e => updateRow(r.year, 'ebitda', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-fade-blue text-xs"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200 text-gray-600 font-medium">{margen}</td>
                    <td className="px-2 py-1 border border-gray-200">
                      <input
                        type="number" min="0"
                        value={r.plantilla}
                        onChange={e => updateRow(r.year, 'plantilla', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-fade-blue text-xs"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-3 py-1.5 border border-gray-200 text-center">
                      <input
                        type="checkbox"
                        checked={!!r.estimativo}
                        onChange={e => updateRow(r.year, 'estimativo', e.target.checked)}
                        className="accent-fade-blue"
                      />
                    </td>
                    <td className="px-2 py-1.5 border border-gray-200 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(r.year)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-2">
        <select
          value={newYear}
          onChange={e => setNewYear(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-fade-blue"
        >
          {YEAR_OPTIONS.map(y => (
            <option key={y} value={y} disabled={usedYears.has(y)}>
              {y}{usedYears.has(y) ? ' (ya añadido)' : ''}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={addYear}
          disabled={usedYears.has(Number(newYear))}
          className="px-3 py-1.5 bg-fade-light text-fade-blue text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-40 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir ejercicio
        </button>
      </div>
    </div>
  )
}

// ── Empresa Form ───────────────────────────────────────────────────────────────

const EMPTY = {
  nombreComercial: '', razonSocial: '', cif: '',
  sector: '', subsector: '', cnae: '', añoConstitucion: '',
  municipio: '', provincia: 'Asturias',
  facturacion: '', ebitda: '', empleados: '', cifraNegocio: '',
  datosHistoricos: [],
  motivoVenta: '',
  tieneValoracion: 'no', valoracionSolicitada: '', precio: '',
  porcentajeVenta: '100%',
  estado: 'captado',
  enlaceDocumento: '', proyectoAsociado: '',
  contactos: [{ nombre: '', email: '', telefono: '', rol: '' }],
  fechaIncorporacion: '', fechaPrimeraReunion: '', notas: '',
}

function migrateInitial(initial) {
  // Migrate old single-contact fields to contactos array
  const contactos = initial.contactos?.length > 0
    ? initial.contactos
    : initial.contactoNombre
      ? [{ nombre: initial.contactoNombre, email: initial.contactoEmail || '', telefono: initial.contactoTelefono || '', rol: initial.contactoRole || '' }]
      : [{ nombre: '', email: '', telefono: '', rol: '' }]

  // Infer tieneValoracion from old data
  const tieneValoracion = initial.tieneValoracion !== undefined
    ? initial.tieneValoracion
    : (initial.valoracionSolicitada ? 'si' : 'no')

  // Migrate nombre → nombreComercial
  const nombreComercial = initial.nombreComercial || initial.nombre || ''

  return { ...EMPTY, ...initial, nombreComercial, tieneValoracion, contactos }
}

function EmpresaForm({ initial = EMPTY, onSave, onCancel }) {
  const [form, setForm] = useState(() => migrateInitial(initial))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      // Keep `nombre` populated for backward compat with matching/reports
      nombre: form.nombreComercial || form.razonSocial,
      // Clear valoración importe when answered No
      valoracionSolicitada: form.tieneValoracion === 'si' ? form.valoracionSolicitada : '',
    })
  }

  const margen = form.facturacion && form.ebitda
    ? ((Number(form.ebitda) / Number(form.facturacion)) * 100).toFixed(1)
    : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Identificación */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Identificación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre comercial" required>
            <input className={inp} required value={form.nombreComercial} onChange={e => set('nombreComercial', e.target.value)} />
          </Field>
          <Field label="Razón social">
            <input className={inp} value={form.razonSocial} onChange={e => set('razonSocial', e.target.value)} />
          </Field>
          <Field label="CIF">
            <input className={inp} value={form.cif} onChange={e => set('cif', e.target.value)} />
          </Field>
          <Field label="Año de constitución">
            <input className={inp} type="number" min="1800" max={CURRENT_YEAR} placeholder={String(CURRENT_YEAR)} value={form.añoConstitucion} onChange={e => set('añoConstitucion', e.target.value)} />
          </Field>
          <Field label="Sector" required>
            <select className={sel} required value={form.sector} onChange={e => set('sector', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Subsector / Actividad">
            <input className={inp} value={form.subsector} onChange={e => set('subsector', e.target.value)} />
          </Field>
          <Field label="CNAE">
            <input className={inp} maxLength={6} value={form.cnae} onChange={e => set('cnae', e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Localización */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Localización</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Municipio">
            <input className={inp} value={form.municipio} onChange={e => set('municipio', e.target.value)} />
          </Field>
          <Field label="Provincia" required>
            <select className={sel} required value={form.provincia} onChange={e => set('provincia', e.target.value)}>
              {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>
      </section>

      {/* Datos financieros */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
          Datos financieros de referencia
        </h3>
        <p className="text-xs text-gray-400 mb-3">Datos principales usados para el matching y los KPIs. Registra la evolución año a año en el histórico de abajo.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Facturación (k€)">
            <input className={inp} type="number" min="0" value={form.facturacion} onChange={e => set('facturacion', e.target.value)} />
          </Field>
          <Field label="EBITDA (k€)">
            <input className={inp} type="number" value={form.ebitda} onChange={e => set('ebitda', e.target.value)} />
          </Field>
          <Field label="Cifra de negocio (k€)">
            <input className={inp} type="number" min="0" value={form.cifraNegocio} onChange={e => set('cifraNegocio', e.target.value)} />
          </Field>
          <Field label="Empleados">
            <input className={inp} type="number" min="0" value={form.empleados} onChange={e => set('empleados', e.target.value)} />
          </Field>
        </div>
        {margen && (
          <p className="mt-2 text-xs text-gray-500">Margen EBITDA: <strong>{margen}%</strong></p>
        )}
      </section>

      {/* Histórico financiero */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
          Histórico financiero por ejercicios
        </h3>
        <HistoricoEditor
          value={form.datosHistoricos || []}
          onChange={v => set('datosHistoricos', v)}
        />
      </section>

      {/* Operación */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Operación</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Motivo de venta">
            <select className={sel} value={form.motivoVenta} onChange={e => set('motivoVenta', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {MOTIVOS_VENTA.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="% en venta">
            <select className={sel} value={form.porcentajeVenta} onChange={e => set('porcentajeVenta', e.target.value)}>
              {PORCENTAJES_VENTA.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="¿Tiene valoración solicitada?">
            <select className={sel} value={form.tieneValoracion} onChange={e => set('tieneValoracion', e.target.value)}>
              <option value="no">No</option>
              <option value="si">Sí</option>
            </select>
          </Field>
          {form.tieneValoracion === 'si' && (
            <Field label="Importe de valoración (k€)">
              <input className={inp} type="number" min="0" value={form.valoracionSolicitada} onChange={e => set('valoracionSolicitada', e.target.value)} />
            </Field>
          )}
          <Field label="Precio (k€)">
            <input className={inp} type="number" min="0" value={form.precio} onChange={e => set('precio', e.target.value)} />
          </Field>
          <Field label="Estado" required>
            <select className={sel} required value={form.estado} onChange={e => set('estado', e.target.value)}>
              {ESTADOS_EMPRESA.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Fecha de incorporación">
            <input className={inp} type="date" value={form.fechaIncorporacion} onChange={e => set('fechaIncorporacion', e.target.value)} />
          </Field>
          <Field label="1ª reunión">
            <input className={inp} type="date" value={form.fechaPrimeraReunion} onChange={e => set('fechaPrimeraReunion', e.target.value)} />
          </Field>
          <Field label="Enlace al documento" col="sm:col-span-2">
            <input className={inp} type="url" placeholder="https://..." value={form.enlaceDocumento} onChange={e => set('enlaceDocumento', e.target.value)} />
          </Field>
          <Field label="Proyecto asociado" col="sm:col-span-2">
            <input className={inp} value={form.proyectoAsociado} onChange={e => set('proyectoAsociado', e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Contactos */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">Personas de contacto</h3>
        <ContactosEditor
          value={form.contactos || []}
          onChange={v => set('contactos', v)}
        />
      </section>

      {/* Notas */}
      <section>
        <Field label="Observaciones / Notas">
          <textarea className={inp} rows={3} value={form.notas} onChange={e => set('notas', e.target.value)} />
        </Field>
      </section>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-fade-dark hover:bg-fade-mid text-white font-semibold text-sm transition-colors">
          Guardar empresa
        </button>
      </div>
    </form>
  )
}

// ── List page ──────────────────────────────────────────────────────────────────

export default function Empresas() {
  const { empresas, addEmpresa, updateEmpresa, deleteEmpresa, loading } = useData()
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterSector, setFilterSector] = useState('')

  const filtered = useMemo(() => {
    return empresas.filter(e => {
      const q = search.toLowerCase()
      const displayName = e.nombreComercial || e.razonSocial || e.nombre || ''
      const matchQ = !q
        || displayName.toLowerCase().includes(q)
        || e.razonSocial?.toLowerCase().includes(q)
        || e.sector?.toLowerCase().includes(q)
        || e.provincia?.toLowerCase().includes(q)
      const matchE = !filterEstado || e.estado === filterEstado
      const matchS = !filterSector || e.sector === filterSector
      return matchQ && matchE && matchS
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [empresas, search, filterEstado, filterSector])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <svg className="animate-spin w-8 h-8 mr-3 text-fade-blue" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Cargando empresas…
    </div>
  )

  function handleSave(form) {
    if (modal === 'add') addEmpresa(form)
    else updateEmpresa(modal.empresa.id, form)
    setModal(null)
  }

  const fmtEur = (n) => n ? `${Number(n).toLocaleString('es-ES')} k€` : '—'
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES') : '—'
  const getEstado = (val) => ESTADOS_EMPRESA.find(e => e.value === val) || { label: val, color: 'gray' }
  const sectoresPresentes = [...new Set(empresas.map(e => e.sector).filter(Boolean))].sort()

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Buscar empresa…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fade-blue"
        />
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue">
          <option value="">Todos los estados</option>
          {ESTADOS_EMPRESA.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue">
          <option value="">Todos los sectores</option>
          {sectoresPresentes.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setModal('add')}
          className="px-4 py-2 bg-fade-dark hover:bg-fade-mid text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva empresa
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} empresa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-medium">No hay empresas que mostrar</p>
            <p className="text-sm mt-1">Añade la primera empresa con el botón superior</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Empresa', 'Sector', 'Provincia', 'Facturación', 'Valoración', 'Estado', 'Incorporación', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(e => {
                  const st = getEstado(e.estado)
                  const displayName = e.nombreComercial || e.razonSocial || e.nombre || '—'
                  const hasHistorico = e.datosHistoricos?.length > 0
                  const valoracion = e.tieneValoracion === 'si' || (e.tieneValoracion === undefined && e.valoracionSolicitada)
                    ? fmtEur(e.valoracionSolicitada)
                    : '—'
                  const fechaInc = e.fechaIncorporacion ? fmtDate(e.fechaIncorporacion) : fmtDate(e.createdAt)
                  return (
                    <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-fade-dark">{displayName}</p>
                        {e.razonSocial && e.nombreComercial && (
                          <p className="text-xs text-gray-400">{e.razonSocial}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {e.proyectoAsociado && (
                            <span className="text-xs text-gray-400">{e.proyectoAsociado}</span>
                          )}
                          {hasHistorico && (
                            <span className="text-xs bg-fade-gold-light text-fade-gold px-1.5 py-0.5 rounded font-medium">
                              {e.datosHistoricos.length} ejercicio{e.datosHistoricos.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{e.sector || '—'}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{e.provincia || '—'}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-mono">{fmtEur(e.facturacion)}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-mono">{valoracion}</td>
                      <td className="px-4 py-3"><Badge label={st.label} color={st.color} /></td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fechaInc}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => setModal({ empresa: e })}
                            className="p-1.5 text-fade-blue hover:bg-fade-light rounded-lg transition-colors" title="Editar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => setConfirm(e.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === 'add' ? 'Nueva empresa vendedora' : `Editar: ${modal.empresa.nombreComercial || modal.empresa.nombre}`}
          onClose={() => setModal(null)}
          size="lg"
        >
          <EmpresaForm
            initial={modal === 'add' ? EMPTY : modal.empresa}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message="¿Eliminar esta empresa? Esta acción no se puede deshacer."
          onConfirm={() => { deleteEmpresa(confirm); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
