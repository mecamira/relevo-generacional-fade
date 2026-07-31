import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { isSupabaseConfigured, dbFetchAll, dbInsert, dbUpdate, dbDelete } from '../utils/supabase'

// ── localStorage helpers (offline cache) ──────────────────────────────────────
const LS = {
  load: (k) => { try { return JSON.parse(localStorage.getItem(k)) || [] } catch { return [] } },
  save: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} },
}
const KEYS = {
  empresas:    'fade_empresas',
  compradores: 'fade_compradores',
  matches:     'fade_matches',
  actas:       'fade_actas',
}

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function now() { return new Date().toISOString() }

// ── Context ───────────────────────────────────────────────────────────────────
const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [empresas,    setEmpresas]    = useState([])
  const [compradores, setCompradores] = useState([])
  const [matches,     setMatches]     = useState([])
  const [actas,       setActas]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const empRef  = useRef(empresas)
  const compRef = useRef(compradores)
  const matRef  = useRef(matches)
  const actRef  = useRef(actas)
  useEffect(() => { empRef.current  = empresas    }, [empresas])
  useEffect(() => { compRef.current = compradores }, [compradores])
  useEffect(() => { matRef.current  = matches     }, [matches])
  useEffect(() => { actRef.current  = actas       }, [actas])

  // ── Load on mount ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        if (isSupabaseConfigured) {
          const [e, c, m, a] = await Promise.all([
            dbFetchAll('empresas'),
            dbFetchAll('compradores'),
            dbFetchAll('matches'),
            dbFetchAll('actas'),
          ])
          setEmpresas(e);    LS.save(KEYS.empresas,    e)
          setCompradores(c); LS.save(KEYS.compradores, c)
          setMatches(m);     LS.save(KEYS.matches,     m)
          setActas(a);       LS.save(KEYS.actas,       a)
        } else {
          setEmpresas(LS.load(KEYS.empresas))
          setCompradores(LS.load(KEYS.compradores))
          setMatches(LS.load(KEYS.matches))
          setActas(LS.load(KEYS.actas))
        }
      } catch (err) {
        console.error('Error loading data:', err)
        setError('No se pudo conectar con la base de datos. Usando datos locales.')
        setEmpresas(LS.load(KEYS.empresas))
        setCompradores(LS.load(KEYS.compradores))
        setMatches(LS.load(KEYS.matches))
        setActas(LS.load(KEYS.actas))
      }
      setLoading(false)
    }
    load()
  }, [])

  // ── Sync helpers ──────────────────────────────────────────────────────────────
  async function syncInsert(table, record) {
    if (!isSupabaseConfigured) return
    try { await dbInsert(table, record) } catch (e) { console.error(`Sync insert ${table}:`, e) }
  }
  async function syncUpdate(table, id, full) {
    if (!isSupabaseConfigured) return
    try { await dbUpdate(table, id, full) } catch (e) { console.error(`Sync update ${table}:`, e) }
  }
  async function syncDelete(table, id) {
    if (!isSupabaseConfigured) return
    try { await dbDelete(table, id) } catch (e) { console.error(`Sync delete ${table}:`, e) }
  }

  // ── Empresas ─────────────────────────────────────────────────────────────────
  const addEmpresa = useCallback((emp) => {
    const record = { ...emp, id: genId(), createdAt: now(), updatedAt: now() }
    setEmpresas(prev => { const next = [record, ...prev]; LS.save(KEYS.empresas, next); return next })
    syncInsert('empresas', record)
    return record
  }, [])

  const updateEmpresa = useCallback((id, changes) => {
    let full = null
    setEmpresas(prev => {
      const next = prev.map(e => { if (e.id === id) { full = { ...e, ...changes, updatedAt: now() }; return full } return e })
      LS.save(KEYS.empresas, next)
      return next
    })
    setTimeout(() => { if (full) syncUpdate('empresas', id, full) }, 0)
  }, [])

  const deleteEmpresa = useCallback((id) => {
    setEmpresas(prev => { const next = prev.filter(e => e.id !== id); LS.save(KEYS.empresas, next); return next })
    syncDelete('empresas', id)
    setMatches(prev => { const next = prev.filter(m => m.empresaId !== id); LS.save(KEYS.matches, next); return next })
    setActas(prev => { const next = prev.filter(a => !(a.tipo === 'empresa' && a.referenciaId === id)); LS.save(KEYS.actas, next); return next })
  }, [])

  // ── Compradores ───────────────────────────────────────────────────────────────
  const addComprador = useCallback((comp) => {
    const record = { ...comp, id: genId(), createdAt: now(), updatedAt: now() }
    setCompradores(prev => { const next = [record, ...prev]; LS.save(KEYS.compradores, next); return next })
    syncInsert('compradores', record)
    return record
  }, [])

  const updateComprador = useCallback((id, changes) => {
    let full = null
    setCompradores(prev => {
      const next = prev.map(c => { if (c.id === id) { full = { ...c, ...changes, updatedAt: now() }; return full } return c })
      LS.save(KEYS.compradores, next)
      return next
    })
    setTimeout(() => { if (full) syncUpdate('compradores', id, full) }, 0)
  }, [])

  const deleteComprador = useCallback((id) => {
    setCompradores(prev => { const next = prev.filter(c => c.id !== id); LS.save(KEYS.compradores, next); return next })
    syncDelete('compradores', id)
    setMatches(prev => { const next = prev.filter(m => m.compradorId !== id); LS.save(KEYS.matches, next); return next })
    setActas(prev => { const next = prev.filter(a => !(a.tipo === 'comprador' && a.referenciaId === id)); LS.save(KEYS.actas, next); return next })
  }, [])

  // ── Matches ──────────────────────────────────────────────────────────────────
  const addMatch = useCallback((match) => {
    const existing = matRef.current.find(
      m => m.empresaId === match.empresaId && m.compradorId === match.compradorId
    )
    if (existing) return existing
    const record = { ...match, id: genId(), createdAt: now(), updatedAt: now() }
    setMatches(prev => { const next = [record, ...prev]; LS.save(KEYS.matches, next); return next })
    syncInsert('matches', record)
    return record
  }, [])

  const updateMatch = useCallback((id, changes) => {
    let full = null
    setMatches(prev => {
      const next = prev.map(m => { if (m.id === id) { full = { ...m, ...changes, updatedAt: now() }; return full } return m })
      LS.save(KEYS.matches, next)
      return next
    })
    setTimeout(() => { if (full) syncUpdate('matches', id, full) }, 0)
  }, [])

  const deleteMatch = useCallback((id) => {
    setMatches(prev => { const next = prev.filter(m => m.id !== id); LS.save(KEYS.matches, next); return next })
    syncDelete('matches', id)
  }, [])

  // ── Actas ────────────────────────────────────────────────────────────────────
  const addActa = useCallback((acta) => {
    const record = { ...acta, id: genId(), createdAt: now(), updatedAt: now() }
    setActas(prev => { const next = [record, ...prev]; LS.save(KEYS.actas, next); return next })
    syncInsert('actas', record)
    return record
  }, [])

  const updateActa = useCallback((id, changes) => {
    let full = null
    setActas(prev => {
      const next = prev.map(a => { if (a.id === id) { full = { ...a, ...changes, updatedAt: now() }; return full } return a })
      LS.save(KEYS.actas, next)
      return next
    })
    setTimeout(() => { if (full) syncUpdate('actas', id, full) }, 0)
  }, [])

  const deleteActa = useCallback((id) => {
    setActas(prev => { const next = prev.filter(a => a.id !== id); LS.save(KEYS.actas, next); return next })
    syncDelete('actas', id)
  }, [])

  return (
    <DataContext.Provider value={{
      empresas, compradores, matches, actas,
      loading, error,
      isOnline: isSupabaseConfigured,
      addEmpresa, updateEmpresa, deleteEmpresa,
      addComprador, updateComprador, deleteComprador,
      addMatch, updateMatch, deleteMatch,
      addActa, updateActa, deleteActa,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside <DataProvider>')
  return ctx
}
