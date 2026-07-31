import { useState, useMemo } from 'react'
import { useData } from '../store/DataContext'
import {
  ESTADOS_COMPRADOR, TIPOS_COMPRADOR, SECTORES, PROVINCIAS,
} from '../utils/constants'
import Badge from '../components/Badge'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ContactosEditor from '../components/ContactosEditor'

// ── Form primitives (module level to avoid focus loss) ───────────────────────

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fade-blue focus:border-transparent text-sm'
const sel = inp + ' bg-white'

function Field({ label, required, children, col }) {
  return (
    <div className={col}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function MultiSelect({ label, options, value = [], onChange }) {
  function toggle(opt) {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt))
    else onChange([...value, opt])
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto bg-white">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 px-1 py-0.5 rounded hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={value.includes(opt)}
              onChange={() => toggle(opt)}
              className="accent-fade-blue"
            />
            <span className="text-sm text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-fade-blue mt-1">{value.length} seleccionado{value.length > 1 ? 's' : ''}</p>
      )}
    </div>
  )
}

// ── Form ─────────────────────────────────────────────────────────────────────

const EMPTY = {
  nombre: '', tipo: '', origen: 'nacional',
  sectoresInteres: [...SECTORES], // todos seleccionados por defecto
  provinciaInteres: [],
  facturacionMin: '', facturacionMax: '',
  ebitdaMin: '', inversionMin: '', inversionMax: '',
  empleadosMax: '', tipoOperacion: '100',
  estado: 'activo',
  contactos: [{ nombre: '', email: '', telefono: '', rol: '' }],
  notas: '',
}

function migrateInitial(initial) {
  // Migrate old single-contact fields to contactos array
  const contactos = initial.contactos?.length > 0
    ? initial.contactos
    : initial.contactoNombre
      ? [{ nombre: initial.contactoNombre, email: initial.contactoEmail || '', telefono: initial.contactoTelefono || '', rol: '' }]
      : [{ nombre: '', email: '', telefono: '', rol: '' }]
  return { ...EMPTY, ...initial, contactos }
}

function CompradorForm({ initial = EMPTY, onSave, onCancel }) {
  const [form, setForm] = useState(() => migrateInitial(initial))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identificación */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
          Identificación
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Nombre / Razón social" required col="sm:col-span-2">
            <input className={inp} required value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </Field>
          <Field label="Tipo de comprador" required col="">
            <select className={sel} required value={form.tipo} onChange={e => set('tipo', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {TIPOS_COMPRADOR.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Origen" col="">
            <select className={sel} value={form.origen} onChange={e => set('origen', e.target.value)}>
              <option value="regional">Regional</option>
              <option value="nacional">Nacional</option>
              <option value="internacional">Internacional</option>
            </select>
          </Field>
          <Field label="Estado" required col="">
            <select className={sel} required value={form.estado} onChange={e => set('estado', e.target.value)}>
              {ESTADOS_COMPRADOR.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Tipo operación" col="">
            <select className={sel} value={form.tipoOperacion} onChange={e => set('tipoOperacion', e.target.value)}>
              <option value="100">100% del capital</option>
              <option value="mayoria">Mayoría (&gt;50%)</option>
              <option value="minoria">Minoría (&lt;50%)</option>
              <option value="indiferente">Indiferente</option>
            </select>
          </Field>
        </div>
      </section>

      {/* Criterios de inversión */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
          Criterios de inversión
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MultiSelect
            label="Sectores de interés"
            options={SECTORES}
            value={form.sectoresInteres}
            onChange={v => set('sectoresInteres', v)}
          />
          <MultiSelect
            label="Provincias de interés"
            options={PROVINCIAS}
            value={form.provinciaInteres}
            onChange={v => set('provinciaInteres', v)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <Field label="Ticket mínimo (k€)" col="">
            <input className={inp} type="number" min="0" value={form.inversionMin} onChange={e => set('inversionMin', e.target.value)} />
          </Field>
          <Field label="Ticket máximo (k€)" col="">
            <input className={inp} type="number" min="0" value={form.inversionMax} onChange={e => set('inversionMax', e.target.value)} />
          </Field>
          <Field label="EBITDA mínimo (k€)" col="">
            <input className={inp} type="number" min="0" value={form.ebitdaMin} onChange={e => set('ebitdaMin', e.target.value)} />
          </Field>
          <Field label="Empleados máximo" col="">
            <input className={inp} type="number" min="0" value={form.empleadosMax} onChange={e => set('empleadosMax', e.target.value)} />
          </Field>
          <Field label="Facturación mínima (k€)" col="">
            <input className={inp} type="number" min="0" value={form.facturacionMin} onChange={e => set('facturacionMin', e.target.value)} />
          </Field>
          <Field label="Facturación máxima (k€)" col="">
            <input className={inp} type="number" min="0" value={form.facturacionMax} onChange={e => set('facturacionMax', e.target.value)} />
          </Field>
        </div>
      </section>

      {/* Contactos */}
      <section>
        <h3 className="text-xs font-bold text-fade-dark uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
          Personas de contacto
        </h3>
        <ContactosEditor
          value={form.contactos || []}
          onChange={v => set('contactos', v)}
        />
      </section>

      {/* Notas */}
      <section>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Observaciones / Notas</label>
        <textarea
          className={inp}
          rows={3}
          value={form.notas}
          onChange={e => set('notas', e.target.value)}
        />
      </section>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-fade-dark hover:bg-fade-mid text-white font-semibold text-sm transition-colors">
          Guardar comprador
        </button>
      </div>
    </form>
  )
}

// ── List page ────────────────────────────────────────────────────────────────

export default function Compradores() {
  const { compradores, addComprador, updateComprador, deleteComprador, loading } = useData()
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [filterTipo, setFilterTipo] = useState('')

  const filtered = useMemo(() => {
    return compradores.filter(c => {
      const q = search.toLowerCase()
      const primerContacto = c.contactos?.[0]?.nombre || c.contactoNombre || ''
      const matchQ = !q || c.nombre?.toLowerCase().includes(q) || primerContacto.toLowerCase().includes(q)
      const matchE = !filterEstado || c.estado === filterEstado
      const matchT = !filterTipo || c.tipo === filterTipo
      return matchQ && matchE && matchT
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [compradores, search, filterEstado, filterTipo])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <svg className="animate-spin w-8 h-8 mr-3 text-fade-blue" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Cargando compradores…
    </div>
  )

  function handleSave(form) {
    if (modal === 'add') addComprador(form)
    else updateComprador(modal.comprador.id, form)
    setModal(null)
  }

  const getEstado = (val) => ESTADOS_COMPRADOR.find(e => e.value === val) || { label: val, color: 'gray' }
  const getTipo = (val) => TIPOS_COMPRADOR.find(t => t.value === val)?.label || val || '—'
  const fmtEur = (n) => n ? `${Number(n).toLocaleString('es-ES')} k€` : '—'

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Buscar comprador…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fade-blue"
        />
        <select
          value={filterEstado}
          onChange={e => setFilterEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
        >
          <option value="">Todos los estados</option>
          {ESTADOS_COMPRADOR.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={filterTipo}
          onChange={e => setFilterTipo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
        >
          <option value="">Todos los tipos</option>
          {TIPOS_COMPRADOR.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button
          onClick={() => setModal('add')}
          className="px-4 py-2 bg-fade-dark hover:bg-fade-mid text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo comprador
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} comprador{filtered.length !== 1 ? 'es' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🤝</p>
            <p className="font-medium">No hay compradores que mostrar</p>
            <p className="text-sm mt-1">Añade el primer comprador con el botón superior</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Comprador', 'Tipo', 'Sectores de interés', 'Ticket', 'EBITDA mín.', 'Estado', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => {
                  const st = getEstado(c.estado)
                  const primerContacto = c.contactos?.[0]?.nombre || c.contactoNombre || ''
                  const ticketRange = c.inversionMin || c.inversionMax
                    ? `${fmtEur(c.inversionMin)} – ${fmtEur(c.inversionMax)}`
                    : '—'
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-fade-dark">{c.nombre}</p>
                        {primerContacto && <p className="text-xs text-gray-400">{primerContacto}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{getTipo(c.tipo)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(c.sectoresInteres || []).slice(0, 3).map(s => (
                            <span key={s} className="text-xs bg-fade-light text-fade-blue px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                          {(c.sectoresInteres || []).length > 3 && (
                            <span className="text-xs text-gray-400">+{c.sectoresInteres.length - 3}</span>
                          )}
                          {(!c.sectoresInteres || c.sectoresInteres.length === 0) && <span className="text-gray-400">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-mono text-xs">{ticketRange}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap font-mono">{fmtEur(c.ebitdaMin)}</td>
                      <td className="px-4 py-3"><Badge label={st.label} color={st.color} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModal({ comprador: c })}
                            className="p-1.5 text-fade-blue hover:bg-fade-light rounded-lg transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setConfirm(c.id)}
                            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
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
          title={modal === 'add' ? 'Nuevo comprador / inversor' : `Editar: ${modal.comprador.nombre}`}
          onClose={() => setModal(null)}
          size="lg"
        >
          <CompradorForm
            initial={modal === 'add' ? EMPTY : modal.comprador}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message="¿Eliminar este comprador? Esta acción no se puede deshacer."
          onConfirm={() => { deleteComprador(confirm); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
