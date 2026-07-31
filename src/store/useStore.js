import { useState, useEffect, useCallback } from 'react'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function now() {
  return new Date().toISOString()
}

const KEYS = {
  empresas:   'fade_empresas',
  compradores:'fade_compradores',
  matches:    'fade_matches',
}

function load(key) {
  try { return JSON.parse(localStorage.getItem(key)) || [] }
  catch { return [] }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Empresas ────────────────────────────────────────────────────────────────

export function useEmpresas() {
  const [empresas, setEmpresas] = useState(() => load(KEYS.empresas))

  const persist = useCallback((data) => {
    setEmpresas(data)
    save(KEYS.empresas, data)
  }, [])

  const addEmpresa = useCallback((empresa) => {
    const record = { ...empresa, id: genId(), createdAt: now(), updatedAt: now() }
    persist([...load(KEYS.empresas), record])
    return record
  }, [persist])

  const updateEmpresa = useCallback((id, changes) => {
    const updated = load(KEYS.empresas).map(e =>
      e.id === id ? { ...e, ...changes, updatedAt: now() } : e
    )
    persist(updated)
  }, [persist])

  const deleteEmpresa = useCallback((id) => {
    persist(load(KEYS.empresas).filter(e => e.id !== id))
  }, [persist])

  const refreshEmpresas = useCallback(() => {
    setEmpresas(load(KEYS.empresas))
  }, [])

  return { empresas, addEmpresa, updateEmpresa, deleteEmpresa, refreshEmpresas }
}

// ── Compradores ──────────────────────────────────────────────────────────────

export function useCompradores() {
  const [compradores, setCompradores] = useState(() => load(KEYS.compradores))

  const persist = useCallback((data) => {
    setCompradores(data)
    save(KEYS.compradores, data)
  }, [])

  const addComprador = useCallback((comprador) => {
    const record = { ...comprador, id: genId(), createdAt: now(), updatedAt: now() }
    persist([...load(KEYS.compradores), record])
    return record
  }, [persist])

  const updateComprador = useCallback((id, changes) => {
    const updated = load(KEYS.compradores).map(c =>
      c.id === id ? { ...c, ...changes, updatedAt: now() } : c
    )
    persist(updated)
  }, [persist])

  const deleteComprador = useCallback((id) => {
    persist(load(KEYS.compradores).filter(c => c.id !== id))
  }, [persist])

  const refreshCompradores = useCallback(() => {
    setCompradores(load(KEYS.compradores))
  }, [])

  return { compradores, addComprador, updateComprador, deleteComprador, refreshCompradores }
}

// ── Matches ──────────────────────────────────────────────────────────────────

export function useMatches() {
  const [matches, setMatches] = useState(() => load(KEYS.matches))

  const persist = useCallback((data) => {
    setMatches(data)
    save(KEYS.matches, data)
  }, [])

  const addMatch = useCallback((match) => {
    const existing = load(KEYS.matches)
    const dup = existing.find(
      m => m.empresaId === match.empresaId && m.compradorId === match.compradorId
    )
    if (dup) return dup
    const record = { ...match, id: genId(), createdAt: now(), updatedAt: now() }
    persist([...existing, record])
    return record
  }, [persist])

  const updateMatch = useCallback((id, changes) => {
    const updated = load(KEYS.matches).map(m =>
      m.id === id ? { ...m, ...changes, updatedAt: now() } : m
    )
    persist(updated)
  }, [persist])

  const deleteMatch = useCallback((id) => {
    persist(load(KEYS.matches).filter(m => m.id !== id))
  }, [persist])

  const refreshMatches = useCallback(() => {
    setMatches(load(KEYS.matches))
  }, [])

  return { matches, addMatch, updateMatch, deleteMatch, refreshMatches }
}

// ── Cross-store helpers ───────────────────────────────────────────────────────

export function getAllData() {
  return {
    empresas:    load(KEYS.empresas),
    compradores: load(KEYS.compradores),
    matches:     load(KEYS.matches),
  }
}
