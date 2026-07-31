import { useState, useMemo } from 'react'
import { useData } from '../store/DataContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

// ── Form primitives (module level) ───────────────────────────────────────────

const inp = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fade-blue focus:border-transparent text-sm'
const sel = inp + ' bg-white'

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

// ── Acta Form ─────────────────────────────────────────────────────────────────

const EMPTY_ACTA = {
  tipo: 'empresa',
  referenciaId: '',
  titulo: '',
  fecha: new Date().toISOString().slice(0, 10),
  asistentes: '',
  contenido: '',
  acuerdos: '',
  proximaReunion: '',
  notas: '',
}

const TIPO_LABELS = {
  empresa:      'Empresa',
  comprador:    'Comprador / Inversor',
  match:        'Match',
  negociacion:  'Negociación',
  general:      'General',
}

function ActaForm({ initial = EMPTY_ACTA, empresas, compradores, matches, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_ACTA, ...initial })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  const linkedOptions = useMemo(() => {
    if (form.tipo === 'empresa')   return empresas.map(e => ({ id: e.id, label: e.nombreComercial || e.nombre }))
    if (form.tipo === 'comprador') return compradores.map(c => ({ id: c.id, label: c.nombre }))
    if (form.tipo === 'match')     return matches.map(m => {
      const emp  = empresas.find(e => e.id === m.empresaId)
      const comp = compradores.find(c => c.id === m.compradorId)
      return { id: m.id, label: `${emp?.nombreComercial || emp?.nombre || '?'} ↔ ${comp?.nombre || '?'}` }
    })
    return []
  }, [form.tipo, empresas, compradores, matches])

  function handleTipoChange(v) {
    set('tipo', v)
    set('referenciaId', '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Tipo de acta" required>
          <select className={sel} required value={form.tipo} onChange={e => handleTipoChange(e.target.value)}>
            {Object.entries(TIPO_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </Field>
        {form.tipo !== 'general' && (
          <Field label="Vinculado a" required>
            <select className={sel} required value={form.referenciaId} onChange={e => set('referenciaId', e.target.value)}>
              <option value="">— Seleccionar —</option>
              {linkedOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </Field>
        )}
        <Field label="Título de la reunión" required col="sm:col-span-2">
          <input className={inp} required value={form.titulo} onChange={e => set('titulo', e.target.value)} />
        </Field>
        <Field label="Fecha" required>
          <input className={inp} type="date" required value={form.fecha} onChange={e => set('fecha', e.target.value)} />
        </Field>
        <Field label="Asistentes">
          <input className={inp} placeholder="Nombres separados por coma" value={form.asistentes} onChange={e => set('asistentes', e.target.value)} />
        </Field>
      </div>

      <Field label="Contenido del acta" required>
        <textarea className={inp} required rows={5} placeholder="Resumen de lo tratado en la reunión…" value={form.contenido} onChange={e => set('contenido', e.target.value)} />
      </Field>

      <Field label="Acuerdos / Compromisos">
        <textarea className={inp} rows={3} placeholder="Puntos acordados, próximos pasos, responsables…" value={form.acuerdos} onChange={e => set('acuerdos', e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Próxima reunión">
          <input className={inp} type="date" value={form.proximaReunion} onChange={e => set('proximaReunion', e.target.value)} />
        </Field>
        <Field label="Notas adicionales">
          <input className={inp} value={form.notas} onChange={e => set('notas', e.target.value)} />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 rounded-lg bg-fade-dark hover:bg-fade-mid text-white font-semibold text-sm transition-colors">
          Guardar acta
        </button>
      </div>
    </form>
  )
}

// ── Acta card (read view) ─────────────────────────────────────────────────────

function ActaCard({ acta, linkedLabel, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const tipoColors = {
    empresa:     'bg-blue-50 text-blue-700',
    comprador:   'bg-green-50 text-green-700',
    match:       'bg-purple-50 text-purple-700',
    negociacion: 'bg-orange-50 text-orange-700',
    general:     'bg-gray-100 text-gray-600',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tipoColors[acta.tipo] || tipoColors.general}`}>
                {TIPO_LABELS[acta.tipo] || acta.tipo}
              </span>
              {linkedLabel && (
                <span className="text-xs text-gray-500 truncate">{linkedLabel}</span>
              )}
              <span className="text-xs text-gray-400">{fmtDate(acta.fecha)}</span>
            </div>
            <h3 className="font-semibold text-fade-dark leading-tight">{acta.titulo}</h3>
            {acta.asistentes && (
              <p className="text-xs text-gray-500 mt-0.5">Asistentes: {acta.asistentes}</p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setExpanded(v => !v)}
              className="p-1.5 text-gray-400 hover:text-fade-blue hover:bg-fade-light rounded-lg transition-colors"
              title={expanded ? 'Colapsar' : 'Expandir'}
            >
              <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button onClick={onEdit} className="p-1.5 text-fade-blue hover:bg-fade-light rounded-lg transition-colors" title="Editar">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={onDelete} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            {acta.contenido && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contenido</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{acta.contenido}</p>
              </div>
            )}
            {acta.acuerdos && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Acuerdos / Compromisos</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap border-l-2 border-fade-blue pl-3">{acta.acuerdos}</p>
              </div>
            )}
            {acta.proximaReunion && (
              <p className="text-xs text-gray-500">Próxima reunión: <strong>{fmtDate(acta.proximaReunion)}</strong></p>
            )}
            {acta.notas && (
              <p className="text-xs text-gray-400 italic">{acta.notas}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Actas() {
  const { actas, addActa, updateActa, deleteActa, empresas, compradores, matches, loading } = useData()
  const [modal, setModal]   = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [search, setSearch]   = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterRef, setFilterRef]   = useState('')

  const filtered = useMemo(() => {
    return actas.filter(a => {
      const q = search.toLowerCase()
      const matchQ = !q
        || a.titulo?.toLowerCase().includes(q)
        || a.contenido?.toLowerCase().includes(q)
        || a.asistentes?.toLowerCase().includes(q)
        || a.acuerdos?.toLowerCase().includes(q)
      const matchT = !filterTipo || a.tipo === filterTipo
      const matchR = !filterRef  || a.referenciaId === filterRef
      return matchQ && matchT && matchR
    }).sort((a, b) => {
      const da = a.fecha || a.createdAt || ''
      const db = b.fecha || b.createdAt || ''
      return db.localeCompare(da)
    })
  }, [actas, search, filterTipo, filterRef])

  const linkedLabel = (acta) => {
    if (acta.tipo === 'empresa')   return empresas.find(e => e.id === acta.referenciaId)?.nombreComercial || empresas.find(e => e.id === acta.referenciaId)?.nombre
    if (acta.tipo === 'comprador') return compradores.find(c => c.id === acta.referenciaId)?.nombre
    if (acta.tipo === 'match') {
      const m    = matches.find(m => m.id === acta.referenciaId)
      const emp  = empresas.find(e => e.id === m?.empresaId)
      const comp = compradores.find(c => c.id === m?.compradorId)
      return m ? `${emp?.nombreComercial || emp?.nombre || '?'} ↔ ${comp?.nombre || '?'}` : null
    }
    return null
  }

  // Ref options for the filter dropdown
  const refOptions = useMemo(() => {
    if (!filterTipo || filterTipo === 'general') return []
    const ids = [...new Set(actas.filter(a => a.tipo === filterTipo).map(a => a.referenciaId))]
    return ids.map(id => {
      if (filterTipo === 'empresa')   { const e = empresas.find(x => x.id === id); return { id, label: e?.nombreComercial || e?.nombre || id } }
      if (filterTipo === 'comprador') { const c = compradores.find(x => x.id === id); return { id, label: c?.nombre || id } }
      if (filterTipo === 'match') {
        const m = matches.find(x => x.id === id)
        const e = empresas.find(x => x.id === m?.empresaId)
        const c = compradores.find(x => x.id === m?.compradorId)
        return { id, label: `${e?.nombreComercial || e?.nombre || '?'} ↔ ${c?.nombre || '?'}` }
      }
      return { id, label: id }
    })
  }, [filterTipo, actas, empresas, compradores, matches])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <svg className="animate-spin w-8 h-8 mr-3 text-fade-blue" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Cargando actas…
    </div>
  )

  function handleSave(form) {
    if (modal === 'add') addActa(form)
    else updateActa(modal.acta.id, form)
    setModal(null)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="search"
          placeholder="Buscar en actas…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fade-blue"
        />
        <select
          value={filterTipo}
          onChange={e => { setFilterTipo(e.target.value); setFilterRef('') }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TIPO_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {refOptions.length > 0 && (
          <select
            value={filterRef}
            onChange={e => setFilterRef(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue max-w-[220px]"
          >
            <option value="">Todos</option>
            {refOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        )}
        <button
          onClick={() => setModal('add')}
          className="px-4 py-2 bg-fade-dark hover:bg-fade-mid text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva acta
        </button>
      </div>

      <p className="text-xs text-gray-500">
        {filtered.length} acta{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-medium">No hay actas que mostrar</p>
          <p className="text-sm mt-1">Crea la primera acta de reunión con el botón superior</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <ActaCard
              key={a.id}
              acta={a}
              linkedLabel={linkedLabel(a)}
              onEdit={() => setModal({ acta: a })}
              onDelete={() => setConfirm(a.id)}
            />
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'add' ? 'Nueva acta de reunión' : 'Editar acta'}
          onClose={() => setModal(null)}
          size="lg"
        >
          <ActaForm
            initial={modal === 'add' ? EMPTY_ACTA : modal.acta}
            empresas={empresas}
            compradores={compradores}
            matches={matches}
            onSave={handleSave}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {confirm && (
        <ConfirmDialog
          message="¿Eliminar esta acta? Esta acción no se puede deshacer."
          onConfirm={() => { deleteActa(confirm); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  )
}
