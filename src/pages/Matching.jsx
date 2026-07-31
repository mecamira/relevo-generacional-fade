import { useState, useMemo } from 'react'
import { useData } from '../store/DataContext'
import { autoMatches, calculateScore, scoreLabel } from '../utils/matching'
import { ESTADOS_MATCH, TIPOS_COMPRADOR } from '../utils/constants'
import Badge from '../components/Badge'
import Modal from '../components/Modal'

function ScoreBar({ score }) {
  const sl = scoreLabel(score)
  const colorBar = { green: 'bg-green-500', blue: 'bg-fade-blue', yellow: 'bg-yellow-400', gray: 'bg-gray-300' }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all ${colorBar[sl.color]}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-bold text-fade-dark w-8 text-right">{score}%</span>
    </div>
  )
}

function MatchCard({ match, empresa, comprador, onUpdateEstado, onRemove, activeEstado }) {
  const sl = scoreLabel(match.score)
  const getTipo = (val) => TIPOS_COMPRADOR.find(t => t.value === val)?.label || val || '—'
  const fmtEur = (n) => n ? `${Number(n).toLocaleString('es-ES')} k€` : '—'
  const estadoInfo = ESTADOS_MATCH.find(e => e.value === activeEstado) || { label: activeEstado, color: 'gray' }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Score header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <Badge label={sl.label} color={sl.color} />
          <div className="flex items-center gap-2">
            <Badge label={estadoInfo.label} color={estadoInfo.color} />
            {onRemove && (
              <button onClick={onRemove} className="text-gray-300 hover:text-red-400 transition-colors" title="Eliminar match">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        <ScoreBar score={match.score} />
      </div>

      {/* Bodies */}
      <div className="grid grid-cols-2 divide-x divide-gray-50 px-5 py-3">
        <div className="pr-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Empresa</p>
          <p className="font-semibold text-fade-dark text-sm leading-snug">{empresa?.nombre || '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{empresa?.sector}</p>
          <p className="text-xs text-gray-500">{empresa?.provincia}</p>
          {empresa?.valoracionSolicitada && (
            <p className="text-xs text-gray-600 mt-1 font-mono">{fmtEur(empresa.valoracionSolicitada)}</p>
          )}
        </div>
        <div className="pl-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Comprador</p>
          <p className="font-semibold text-fade-dark text-sm leading-snug">{comprador?.nombre || '—'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{getTipo(comprador?.tipo)}</p>
          {(comprador?.inversionMin || comprador?.inversionMax) && (
            <p className="text-xs text-gray-500">
              Ticket: {fmtEur(comprador.inversionMin)} – {fmtEur(comprador.inversionMax)}
            </p>
          )}
        </div>
      </div>

      {/* Estado selector */}
      {onUpdateEstado && (
        <div className="px-5 pb-4">
          <select
            value={activeEstado || 'sugerido'}
            onChange={e => onUpdateEstado(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-fade-blue"
          >
            {ESTADOS_MATCH.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

// ── Notes modal ──────────────────────────────────────────────────────────────

function NotasModal({ match, onSave, onClose }) {
  const [notas, setNotas] = useState(match.notasMatch || '')
  return (
    <Modal title="Notas del match" onClose={onClose} size="sm">
      <div className="space-y-4">
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fade-blue"
          rows={5}
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Anota aquí el estado de la negociación, próximos pasos, comentarios…"
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={() => { onSave(notas); onClose() }}
            className="px-5 py-2 text-sm bg-fade-dark text-white rounded-lg hover:bg-fade-mid"
          >
            Guardar notas
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Matching() {
  // All hooks MUST come before any early return
  const { empresas, compradores, matches, addMatch, updateMatch, deleteMatch, loading } = useData()
  const [tab, setTab] = useState('auto')
  const [filterEmpresa, setFilterEmpresa] = useState('')
  const [filterComprador, setFilterComprador] = useState('')
  const [notasModal, setNotasModal] = useState(null)
  const [manualEmp, setManualEmp] = useState('')
  const [manualComp, setManualComp] = useState('')

  const suggestions = useMemo(() => {
    const existing = new Set(matches.map(m => `${m.empresaId}__${m.compradorId}`))
    return autoMatches(empresas, compradores)
      .filter(s => !existing.has(`${s.empresaId}__${s.compradorId}`))
      .map(s => ({
        ...s,
        empresa: empresas.find(e => e.id === s.empresaId),
        comprador: compradores.find(c => c.id === s.compradorId),
      }))
      .filter(s => s.empresa && s.comprador)
  }, [empresas, compradores, matches])

  // Active matches (manual + confirmed from auto)
  const activeMatches = useMemo(() => {
    return matches
      .map(m => ({
        ...m,
        empresa: empresas.find(e => e.id === m.empresaId),
        comprador: compradores.find(c => c.id === m.compradorId),
        score: m.score ?? calculateScore(
          empresas.find(e => e.id === m.empresaId) || {},
          compradores.find(c => c.id === m.compradorId) || {}
        ),
      }))
      .filter(m => m.empresa && m.comprador)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
  }, [matches, empresas, compradores])

  // Early return after all hooks
  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <svg className="animate-spin w-8 h-8 mr-3 text-fade-blue" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      Cargando datos…
    </div>
  )

  function confirmMatch(s) {
    addMatch({
      empresaId: s.empresaId,
      compradorId: s.compradorId,
      score: s.score,
      estadoMatch: 'sugerido',
      notasMatch: '',
    })
  }

  function createManualMatch() {
    if (!manualEmp || !manualComp) return
    const score = calculateScore(
      empresas.find(e => e.id === manualEmp) || {},
      compradores.find(c => c.id === manualComp) || {}
    )
    addMatch({ empresaId: manualEmp, compradorId: manualComp, score, estadoMatch: 'presentado', notasMatch: '' })
    setManualEmp('')
    setManualComp('')
  }

  const TABS = [
    { key: 'auto',        label: `Sugerencias (${suggestions.length})` },
    { key: 'seguimiento', label: `Seguimiento (${activeMatches.length})` },
    { key: 'manual',      label: 'Crear match manual' },
  ]

  const filteredSug = suggestions.filter(s => {
    const fe = !filterEmpresa || s.empresaId === filterEmpresa
    const fc = !filterComprador || s.compradorId === filterComprador
    return fe && fc
  })

  const filteredActive = activeMatches.filter(m => {
    const fe = !filterEmpresa || m.empresaId === filterEmpresa
    const fc = !filterComprador || m.compradorId === filterComprador
    return fe && fc
  })

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white text-fade-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters (for auto + seguimiento) */}
      {tab !== 'manual' && (
        <div className="flex gap-3 flex-wrap">
          <select
            value={filterEmpresa}
            onChange={e => setFilterEmpresa(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
          >
            <option value="">Todas las empresas</option>
            {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
          <select
            value={filterComprador}
            onChange={e => setFilterComprador(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
          >
            <option value="">Todos los compradores</option>
            {compradores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      )}

      {/* AUTO suggestions */}
      {tab === 'auto' && (
        <div>
          {filteredSug.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">No hay sugerencias automáticas</p>
              <p className="text-sm mt-1">
                Añade más empresas y compradores con criterios compatibles para generar sugerencias
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSug.map((s, i) => (
                <div key={i} className="relative">
                  <MatchCard
                    match={s}
                    empresa={s.empresa}
                    comprador={s.comprador}
                    activeEstado="sugerido"
                  />
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => confirmMatch(s)}
                      className="w-full py-2 bg-fade-blue hover:bg-fade-mid text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Confirmar y añadir al seguimiento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SEGUIMIENTO */}
      {tab === 'seguimiento' && (
        <div>
          {filteredActive.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-100 text-gray-400">
              <p className="text-4xl mb-3">🔗</p>
              <p className="font-medium">No hay matches en seguimiento</p>
              <p className="text-sm mt-1">Confirma sugerencias automáticas o crea un match manual</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredActive.map(m => (
                <div key={m.id}>
                  <MatchCard
                    match={m}
                    empresa={m.empresa}
                    comprador={m.comprador}
                    activeEstado={m.estadoMatch}
                    onUpdateEstado={(val) => updateMatch(m.id, { estadoMatch: val })}
                    onRemove={() => deleteMatch(m.id)}
                  />
                  <div className="px-4 pb-4 pt-1">
                    <button
                      onClick={() => setNotasModal(m)}
                      className="w-full py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {m.notasMatch ? '📝 Ver/editar notas' : '📝 Añadir notas'}
                    </button>
                    {m.notasMatch && (
                      <p className="text-xs text-gray-400 mt-1.5 px-1 line-clamp-2">{m.notasMatch}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MANUAL */}
      {tab === 'manual' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-lg">
          <p className="text-sm text-gray-600 mb-5">
            Selecciona una empresa y un comprador para crear un match manual, independientemente del score automático.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Empresa vendedora</label>
              <select
                value={manualEmp}
                onChange={e => setManualEmp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
              >
                <option value="">— Seleccionar empresa —</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.sector})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Comprador / Inversor</label>
              <select
                value={manualComp}
                onChange={e => setManualComp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
              >
                <option value="">— Seleccionar comprador —</option>
                {compradores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            {manualEmp && manualComp && (() => {
              const emp = empresas.find(e => e.id === manualEmp)
              const comp = compradores.find(c => c.id === manualComp)
              const score = calculateScore(emp || {}, comp || {})
              const sl = scoreLabel(score)
              return (
                <div className="bg-fade-light rounded-lg p-3 text-sm">
                  <p className="text-fade-dark font-medium">Score de compatibilidad: <span className="font-bold">{score}%</span></p>
                  <Badge label={sl.label} color={sl.color} className="mt-1" />
                </div>
              )
            })()}

            <button
              onClick={createManualMatch}
              disabled={!manualEmp || !manualComp}
              className="w-full py-2.5 bg-fade-dark hover:bg-fade-mid text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-40"
            >
              Crear match manual
            </button>
          </div>
        </div>
      )}

      {/* Notas modal */}
      {notasModal && (
        <NotasModal
          match={notasModal}
          onSave={(notas) => updateMatch(notasModal.id, { notasMatch: notas })}
          onClose={() => setNotasModal(null)}
        />
      )}
    </div>
  )
}
