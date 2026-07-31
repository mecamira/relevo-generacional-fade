import { useState, useMemo } from 'react'
import { useData } from '../store/DataContext'
import { calculateScore, scoreLabel } from '../utils/matching'
import { ESTADOS_EMPRESA, ESTADOS_COMPRADOR, ESTADOS_MATCH, TIPOS_COMPRADOR } from '../utils/constants'
import Badge from '../components/Badge'

const fmtEur = (n) => n ? `${Number(n).toLocaleString('es-ES')} k€` : '—'
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
const getLabel = (list, val) => list.find(i => i.value === val) || { label: val || '—', color: 'gray' }

// ── Empresa report ────────────────────────────────────────────────────────────

function EmpresaReport({ empresa, matches, compradores, dateFrom, dateTo }) {
  const matchesEmp = matches
    .filter(m => m.empresaId === empresa.id && inRange(m.createdAt, dateFrom, dateTo))
    .map(m => ({
      ...m,
      comprador: compradores.find(c => c.id === m.compradorId),
      score: m.score ?? calculateScore(empresa, compradores.find(c => c.id === m.compradorId) || {}),
    }))

  const st = getLabel(ESTADOS_EMPRESA, empresa.estado)
  const displayName = empresa.nombreComercial || empresa.nombre || '—'
  const margen = empresa.facturacion && empresa.ebitda
    ? ((empresa.ebitda / empresa.facturacion) * 100).toFixed(1) + '%'
    : '—'
  const multiple = empresa.tieneValoracion === 'si' && empresa.valoracionSolicitada && empresa.ebitda
    ? (empresa.valoracionSolicitada / empresa.ebitda).toFixed(1) + 'x'
    : '—'

  const contactos = empresa.contactos?.length > 0
    ? empresa.contactos
    : empresa.contactoNombre
      ? [{ nombre: empresa.contactoNombre, email: empresa.contactoEmail, telefono: empresa.contactoTelefono, rol: empresa.contactoRole }]
      : []

  return (
    <div className="report-page bg-white">
      {/* Header */}
      <div className="report-header flex justify-between items-start mb-8 pb-6 border-b-2 border-fade-dark">
        <div>
          <p className="text-3xl font-black tracking-widest text-fade-dark">FADE</p>
          <p className="text-xs font-semibold text-fade-gold tracking-widest uppercase">Relevo Generacional</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Informe confidencial</p>
          <p className="text-xs text-gray-400">{fmtDate(new Date().toISOString())}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-fade-dark mb-0.5">{displayName}</h1>
      {empresa.razonSocial && empresa.razonSocial !== displayName && (
        <p className="text-sm text-gray-500 mb-1">{empresa.razonSocial}</p>
      )}
      <p className="text-sm text-gray-400 mb-1">Ficha de empresa en proceso de relevo generacional</p>
      {(dateFrom || dateTo) && (
        <p className="text-xs text-gray-400 mb-6">
          Período analizado: {dateFrom ? fmtDate(dateFrom) : '—'} → {dateTo ? fmtDate(dateTo) : '—'}
        </p>
      )}
      {!dateFrom && !dateTo && <div className="mb-6" />}

      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <Badge label={st.label} color={st.color} />
        {empresa.proyectoAsociado && (
          <span className="text-xs text-gray-500">Proyecto: {empresa.proyectoAsociado}</span>
        )}
        {empresa.enlaceDocumento && (
          <a href={empresa.enlaceDocumento} target="_blank" rel="noopener noreferrer"
            className="text-xs text-fade-blue underline">Ver documento</a>
        )}
      </div>

      {/* Grid datos */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
        <Section title="Identificación">
          <Row k="Nombre comercial" v={empresa.nombreComercial || empresa.nombre} />
          <Row k="Razón social" v={empresa.razonSocial} />
          <Row k="CIF" v={empresa.cif} />
          <Row k="Año constitución" v={empresa.añoConstitucion} />
          <Row k="Sector" v={empresa.sector} />
          <Row k="Subsector" v={empresa.subsector} />
          <Row k="CNAE" v={empresa.cnae} />
        </Section>
        <Section title="Localización">
          <Row k="Municipio" v={empresa.municipio} />
          <Row k="Provincia" v={empresa.provincia} />
        </Section>
        <Section title="Datos financieros">
          <Row k="Facturación" v={fmtEur(empresa.facturacion)} />
          <Row k="EBITDA" v={fmtEur(empresa.ebitda)} />
          <Row k="Margen EBITDA" v={margen} />
          <Row k="Cifra de negocio" v={fmtEur(empresa.cifraNegocio)} />
          <Row k="Empleados" v={empresa.empleados} />
        </Section>
        <Section title="Operación">
          <Row k="Valoración solicitada" v={empresa.tieneValoracion === 'si' ? fmtEur(empresa.valoracionSolicitada) : 'No'} />
          <Row k="Múltiplo" v={multiple} />
          <Row k="Precio" v={fmtEur(empresa.precio)} />
          <Row k="% en venta" v={empresa.porcentajeVenta} />
          <Row k="Motivo de venta" v={empresa.motivoVenta} />
          <Row k="Fecha incorporación" v={fmtDate(empresa.fechaIncorporacion || empresa.createdAt)} />
          <Row k="1ª reunión" v={fmtDate(empresa.fechaPrimeraReunion)} />
        </Section>
      </div>

      {/* Contactos */}
      {contactos.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personas de contacto</p>
          {contactos.map((c, i) => (
            <div key={i} className="flex gap-6 text-sm mb-1">
              {c.nombre && <span className="font-medium text-gray-800">{c.nombre}</span>}
              {c.rol && <span className="text-gray-500">{c.rol}</span>}
              {c.email && <span className="text-gray-500">{c.email}</span>}
              {c.telefono && <span className="text-gray-500">{c.telefono}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Histórico financiero */}
      {empresa.datosHistoricos && empresa.datosHistoricos.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Histórico financiero por ejercicios</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border border-gray-200">Ejercicio</th>
                <th className="text-right px-3 py-2 border border-gray-200">Facturación</th>
                <th className="text-right px-3 py-2 border border-gray-200">EBITDA</th>
                <th className="text-right px-3 py-2 border border-gray-200">Margen</th>
                <th className="text-right px-3 py-2 border border-gray-200">Plantilla</th>
                <th className="text-center px-3 py-2 border border-gray-200">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {[...empresa.datosHistoricos].sort((a, b) => b.year - a.year).map(row => {
                const m = row.facturacion && row.ebitda
                  ? ((row.ebitda / row.facturacion) * 100).toFixed(1) + '%' : '—'
                return (
                  <tr key={row.year} className="border-b border-gray-100">
                    <td className="px-3 py-2 border border-gray-200 font-bold text-fade-dark">{row.year}</td>
                    <td className="px-3 py-2 border border-gray-200 text-right font-mono">{fmtEur(row.facturacion)}</td>
                    <td className="px-3 py-2 border border-gray-200 text-right font-mono">{fmtEur(row.ebitda)}</td>
                    <td className="px-3 py-2 border border-gray-200 text-right">{m}</td>
                    <td className="px-3 py-2 border border-gray-200 text-right">{row.plantilla || '—'}</td>
                    <td className="px-3 py-2 border border-gray-200 text-center text-gray-500">{row.estimativo ? 'Estimado' : 'Real'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {empresa.notas && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Observaciones</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap border-l-2 border-fade-blue pl-3">{empresa.notas}</p>
        </div>
      )}

      {/* Matches */}
      {matchesEmp.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Compradores en seguimiento</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border border-gray-200">Comprador</th>
                <th className="text-left px-3 py-2 border border-gray-200">Tipo</th>
                <th className="text-left px-3 py-2 border border-gray-200">Score</th>
                <th className="text-left px-3 py-2 border border-gray-200">Estado</th>
              </tr>
            </thead>
            <tbody>
              {matchesEmp.map(m => {
                const mst = getLabel(ESTADOS_MATCH, m.estadoMatch)
                return (
                  <tr key={m.id} className="border-b border-gray-100">
                    <td className="px-3 py-2 border border-gray-200 font-medium">{m.comprador?.nombre || '—'}</td>
                    <td className="px-3 py-2 border border-gray-200">{TIPOS_COMPRADOR.find(t => t.value === m.comprador?.tipo)?.label || '—'}</td>
                    <td className="px-3 py-2 border border-gray-200 font-bold">{m.score}%</td>
                    <td className="px-3 py-2 border border-gray-200">{mst.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Federación Asturiana de Empresarios · FADE Relevo Generacional · Documento confidencial
      </div>
    </div>
  )
}

// ── Comprador report ──────────────────────────────────────────────────────────

function CompradorReport({ comprador, matches, empresas, dateFrom, dateTo }) {
  const matchesComp = matches
    .filter(m => m.compradorId === comprador.id && inRange(m.createdAt, dateFrom, dateTo))
    .map(m => ({
      ...m,
      empresa: empresas.find(e => e.id === m.empresaId),
      score: m.score ?? calculateScore(empresas.find(e => e.id === m.empresaId) || {}, comprador),
    }))

  const st = getLabel(ESTADOS_COMPRADOR, comprador.estado)
  const getTipo = (val) => TIPOS_COMPRADOR.find(t => t.value === val)?.label || val || '—'
  const ticketRange = comprador.inversionMin || comprador.inversionMax
    ? `${fmtEur(comprador.inversionMin)} – ${fmtEur(comprador.inversionMax)}`
    : '—'

  const contactos = comprador.contactos?.length > 0
    ? comprador.contactos
    : comprador.contactoNombre
      ? [{ nombre: comprador.contactoNombre, email: comprador.contactoEmail, telefono: comprador.contactoTelefono }]
      : []

  return (
    <div className="report-page bg-white">
      <div className="report-header flex justify-between items-start mb-8 pb-6 border-b-2 border-fade-dark">
        <div>
          <p className="text-3xl font-black tracking-widest text-fade-dark">FADE</p>
          <p className="text-xs font-semibold text-fade-gold tracking-widest uppercase">Relevo Generacional</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Informe confidencial</p>
          <p className="text-xs text-gray-400">{fmtDate(new Date().toISOString())}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-fade-dark mb-1">{comprador.nombre}</h1>
      <p className="text-sm text-gray-500 mb-1">Ficha de comprador / inversor</p>
      {(dateFrom || dateTo) && (
        <p className="text-xs text-gray-400 mb-4">
          Período analizado: {dateFrom ? fmtDate(dateFrom) : '—'} → {dateTo ? fmtDate(dateTo) : '—'}
        </p>
      )}
      {!dateFrom && !dateTo && <div className="mb-4" />}
      <Badge label={st.label} color={st.color} />

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-6 mb-8">
        <Section title="Identificación">
          <Row k="Tipo" v={getTipo(comprador.tipo)} />
          <Row k="Origen" v={comprador.origen} />
          <Row k="Tipo operación" v={comprador.tipoOperacion} />
        </Section>
        <Section title="Criterios de inversión">
          <Row k="Ticket" v={ticketRange} />
          <Row k="EBITDA mínimo" v={fmtEur(comprador.ebitdaMin)} />
          <Row k="Facturación" v={`${fmtEur(comprador.facturacionMin)} – ${fmtEur(comprador.facturacionMax)}`} />
          <Row k="Empleados máx." v={comprador.empleadosMax} />
        </Section>
        <Section title="Sectores de interés" col="col-span-2">
          <p className="text-sm text-gray-700">
            {comprador.sectoresInteres?.join(', ') || '—'}
          </p>
        </Section>
        <Section title="Provincias de interés" col="col-span-2">
          <p className="text-sm text-gray-700">
            {comprador.provinciaInteres?.join(', ') || 'Sin preferencia geográfica'}
          </p>
        </Section>
      </div>

      {contactos.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Personas de contacto</p>
          {contactos.map((c, i) => (
            <div key={i} className="flex gap-6 text-sm mb-1">
              {c.nombre && <span className="font-medium text-gray-800">{c.nombre}</span>}
              {c.rol && <span className="text-gray-500">{c.rol}</span>}
              {c.email && <span className="text-gray-500">{c.email}</span>}
              {c.telefono && <span className="text-gray-500">{c.telefono}</span>}
            </div>
          ))}
        </div>
      )}

      {comprador.notas && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Observaciones</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap border-l-2 border-fade-blue pl-3">{comprador.notas}</p>
        </div>
      )}

      {matchesComp.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Empresas en seguimiento</p>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 border border-gray-200">Empresa</th>
                <th className="text-left px-3 py-2 border border-gray-200">Sector</th>
                <th className="text-left px-3 py-2 border border-gray-200">Valoración</th>
                <th className="text-left px-3 py-2 border border-gray-200">Score</th>
                <th className="text-left px-3 py-2 border border-gray-200">Estado</th>
              </tr>
            </thead>
            <tbody>
              {matchesComp.map(m => {
                const mst = getLabel(ESTADOS_MATCH, m.estadoMatch)
                const empName = m.empresa?.nombreComercial || m.empresa?.nombre || '—'
                return (
                  <tr key={m.id}>
                    <td className="px-3 py-2 border border-gray-200 font-medium">{empName}</td>
                    <td className="px-3 py-2 border border-gray-200">{m.empresa?.sector || '—'}</td>
                    <td className="px-3 py-2 border border-gray-200 font-mono">{fmtEur(m.empresa?.valoracionSolicitada)}</td>
                    <td className="px-3 py-2 border border-gray-200 font-bold">{m.score}%</td>
                    <td className="px-3 py-2 border border-gray-200">{mst.label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Federación Asturiana de Empresarios · FADE Relevo Generacional · Documento confidencial
      </div>
    </div>
  )
}

// ── General report ────────────────────────────────────────────────────────────

function inRange(iso, from, to) {
  if (!iso) return true
  const d = iso.slice(0, 10)
  if (from && d < from) return false
  if (to   && d > to)   return false
  return true
}

function GeneralReport({ empresas, compradores, matches, dateFrom, dateTo }) {
  const activeEmp  = empresas.filter(e =>
    !['cerrado_fracaso', 'descartado'].includes(e.estado) &&
    inRange(e.createdAt, dateFrom, dateTo)
  )
  const activeComp = compradores.filter(c =>
    c.estado !== 'cerrado' &&
    inRange(c.createdAt, dateFrom, dateTo)
  )
  const activeMatches = matches.filter(m => inRange(m.createdAt, dateFrom, dateTo))

  return (
    <div className="report-page bg-white">
      <div className="report-header flex justify-between items-start mb-8 pb-6 border-b-2 border-fade-dark">
        <div>
          <p className="text-3xl font-black tracking-widest text-fade-dark">FADE</p>
          <p className="text-xs font-semibold text-fade-gold tracking-widest uppercase">Relevo Generacional</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Resumen de cartera</p>
          <p className="text-xs text-gray-400">{fmtDate(new Date().toISOString())}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-fade-dark mb-1">Resumen general de cartera</h1>
      {(dateFrom || dateTo) && (
        <p className="text-sm text-gray-500 mb-6">
          Período: {dateFrom ? fmtDate(dateFrom) : '—'} → {dateTo ? fmtDate(dateTo) : '—'}
        </p>
      )}
      {!dateFrom && !dateTo && <div className="mb-6" />}

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Empresas en cartera',      v: activeEmp.length },
          { l: 'Compradores activos',       v: activeComp.filter(c => c.estado === 'activo').length },
          { l: 'Matches en curso',          v: activeMatches.filter(m => m.estadoMatch !== 'descartado').length },
          { l: 'Op. cerradas con éxito',    v: activeEmp.filter(e => e.estado === 'cerrado_exito').length },
        ].map(({ l, v }) => (
          <div key={l} className="bg-fade-light rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-fade-dark">{v}</p>
            <p className="text-xs text-gray-500 mt-1">{l}</p>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Empresas en cartera activa</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {['Empresa', 'Sector', 'Provincia', 'Facturación', 'EBITDA', 'Valoración', 'Estado'].map(h => (
                <th key={h} className="text-left px-3 py-2 border border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeEmp.map(e => {
              const st = getLabel(ESTADOS_EMPRESA, e.estado)
              const displayName = e.nombreComercial || e.nombre || '—'
              const valoracion = (e.tieneValoracion === 'si' || (e.tieneValoracion === undefined && e.valoracionSolicitada))
                ? fmtEur(e.valoracionSolicitada) : '—'
              return (
                <tr key={e.id} className="border-b border-gray-100">
                  <td className="px-3 py-2 border border-gray-200 font-medium">{displayName}</td>
                  <td className="px-3 py-2 border border-gray-200">{e.sector || '—'}</td>
                  <td className="px-3 py-2 border border-gray-200">{e.provincia || '—'}</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">{fmtEur(e.facturacion)}</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">{fmtEur(e.ebitda)}</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">{valoracion}</td>
                  <td className="px-3 py-2 border border-gray-200">{st.label}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Compradores activos</p>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {['Comprador', 'Tipo', 'Sectores interés', 'Ticket', 'Estado'].map(h => (
                <th key={h} className="text-left px-3 py-2 border border-gray-200">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeComp.map(c => {
              const st = getLabel(ESTADOS_COMPRADOR, c.estado)
              return (
                <tr key={c.id}>
                  <td className="px-3 py-2 border border-gray-200 font-medium">{c.nombre}</td>
                  <td className="px-3 py-2 border border-gray-200">{TIPOS_COMPRADOR.find(t => t.value === c.tipo)?.label || '—'}</td>
                  <td className="px-3 py-2 border border-gray-200">{(c.sectoresInteres || []).slice(0, 3).join(', ') || '—'}</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono text-xs">
                    {c.inversionMin || c.inversionMax ? `${fmtEur(c.inversionMin)}–${fmtEur(c.inversionMax)}` : '—'}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">{st.label}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Federación Asturiana de Empresarios · FADE Relevo Generacional · Documento confidencial
      </div>
    </div>
  )
}

// ── Monthly summary report ────────────────────────────────────────────────────

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

function MonthlyReport({ empresas, compradores, matches, actas, month, year }) {
  const inMonth = (iso) => {
    if (!iso) return false
    const d = new Date(iso)
    return d.getFullYear() === year && d.getMonth() === month
  }

  const newEmpresas    = empresas.filter(e => inMonth(e.createdAt))
  const newCompradores = compradores.filter(c => inMonth(c.createdAt))
  const newMatches     = matches.filter(m => inMonth(m.createdAt))
  const actasMes       = actas.filter(a => inMonth(a.fecha || a.createdAt))

  const mesLabel = `${MESES[month]} ${year}`

  const empName = (e) => e?.nombreComercial || e?.nombre || '—'
  const compName = (c) => c?.nombre || '—'

  const TIPO_LABELS = { empresa: 'Empresa', comprador: 'Comprador/Inversor', match: 'Match', general: 'General' }

  return (
    <div className="report-page bg-white">
      <div className="report-header flex justify-between items-start mb-8 pb-6 border-b-2 border-fade-dark">
        <div>
          <p className="text-3xl font-black tracking-widest text-fade-dark">FADE</p>
          <p className="text-xs font-semibold text-fade-gold tracking-widest uppercase">Relevo Generacional</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Resumen mensual</p>
          <p className="text-xs text-gray-400">{fmtDate(new Date().toISOString())}</p>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-fade-dark mb-1">Resumen de {mesLabel}</h1>
      <p className="text-sm text-gray-500 mb-8">Principales actividades registradas en el mes</p>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Nuevas empresas',      v: newEmpresas.length },
          { l: 'Nuevos compradores',   v: newCompradores.length },
          { l: 'Nuevos matches',       v: newMatches.length },
          { l: 'Actas de reunión',     v: actasMes.length },
        ].map(({ l, v }) => (
          <div key={l} className="bg-fade-light rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-fade-dark">{v}</p>
            <p className="text-xs text-gray-500 mt-1">{l}</p>
          </div>
        ))}
      </div>

      {/* Nuevas empresas */}
      {newEmpresas.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nuevas empresas incorporadas</p>
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-gray-50">
              {['Empresa', 'Sector', 'Provincia', 'Facturación', 'Estado'].map(h => (
                <th key={h} className="text-left px-3 py-2 border border-gray-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {newEmpresas.map(e => (
                <tr key={e.id}>
                  <td className="px-3 py-2 border border-gray-200 font-medium">{empName(e)}</td>
                  <td className="px-3 py-2 border border-gray-200">{e.sector || '—'}</td>
                  <td className="px-3 py-2 border border-gray-200">{e.provincia || '—'}</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono">{fmtEur(e.facturacion)}</td>
                  <td className="px-3 py-2 border border-gray-200">{getLabel(ESTADOS_EMPRESA, e.estado).label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Nuevos compradores */}
      {newCompradores.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nuevos compradores / inversores</p>
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-gray-50">
              {['Comprador', 'Tipo', 'Ticket', 'Estado'].map(h => (
                <th key={h} className="text-left px-3 py-2 border border-gray-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {newCompradores.map(c => (
                <tr key={c.id}>
                  <td className="px-3 py-2 border border-gray-200 font-medium">{c.nombre}</td>
                  <td className="px-3 py-2 border border-gray-200">{TIPOS_COMPRADOR.find(t => t.value === c.tipo)?.label || '—'}</td>
                  <td className="px-3 py-2 border border-gray-200 font-mono text-xs">
                    {c.inversionMin || c.inversionMax ? `${fmtEur(c.inversionMin)}–${fmtEur(c.inversionMax)}` : '—'}
                  </td>
                  <td className="px-3 py-2 border border-gray-200">{getLabel(ESTADOS_COMPRADOR, c.estado).label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Nuevos matches */}
      {newMatches.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Nuevos matches creados</p>
          <table className="w-full text-xs border-collapse">
            <thead><tr className="bg-gray-50">
              {['Empresa', 'Comprador', 'Score', 'Estado'].map(h => (
                <th key={h} className="text-left px-3 py-2 border border-gray-200">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {newMatches.map(m => {
                const e = empresas.find(x => x.id === m.empresaId)
                const c = compradores.find(x => x.id === m.compradorId)
                return (
                  <tr key={m.id}>
                    <td className="px-3 py-2 border border-gray-200 font-medium">{empName(e)}</td>
                    <td className="px-3 py-2 border border-gray-200">{compName(c)}</td>
                    <td className="px-3 py-2 border border-gray-200 font-bold">{m.score ?? '—'}%</td>
                    <td className="px-3 py-2 border border-gray-200">{getLabel(ESTADOS_MATCH, m.estadoMatch).label}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Actas del mes */}
      {actasMes.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Actas de reunión del mes</p>
          {actasMes.sort((a, b) => (a.fecha || '').localeCompare(b.fecha || '')).map(a => {
            let ref = ''
            if (a.tipo === 'empresa')   ref = empresas.find(e => e.id === a.referenciaId)?.nombreComercial || empresas.find(e => e.id === a.referenciaId)?.nombre || ''
            if (a.tipo === 'comprador') ref = compradores.find(c => c.id === a.referenciaId)?.nombre || ''
            return (
              <div key={a.id} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-fade-blue">{fmtDate(a.fecha)}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{TIPO_LABELS[a.tipo] || a.tipo}</span>
                  {ref && <span className="text-xs text-gray-500">{ref}</span>}
                </div>
                <p className="text-sm font-semibold text-gray-800 mb-1">{a.titulo}</p>
                {a.asistentes && <p className="text-xs text-gray-500 mb-1">Asistentes: {a.asistentes}</p>}
                {a.acuerdos && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-500 mb-0.5">Acuerdos:</p>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{a.acuerdos}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {newEmpresas.length === 0 && newCompradores.length === 0 && newMatches.length === 0 && actasMes.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No se registraron actividades en {mesLabel}</p>
        </div>
      )}

      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Federación Asturiana de Empresarios · FADE Relevo Generacional · Documento confidencial
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ title, children, col }) {
  return (
    <div className={col}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ k, v }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-gray-400 w-36 flex-shrink-0">{k}:</span>
      <span className="text-gray-800 font-medium">{v || '—'}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

const TODAY = new Date()

export default function Informes() {
  const { empresas, compradores, matches, actas } = useData()
  const [type, setType]           = useState('general')
  const [selectedId, setSelectedId] = useState('')
  const [reportMonth, setReportMonth] = useState(TODAY.getMonth())
  const [reportYear,  setReportYear]  = useState(TODAY.getFullYear())
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const selected = type === 'empresa'
    ? empresas.find(e => e.id === selectedId)
    : compradores.find(c => c.id === selectedId)

  const canGenerate = type === 'general' || type === 'mensual' || !!selectedId

  function handleExportBackup() {
    const payload = {
      date: new Date().toISOString().slice(0, 10),
      exportedAt: new Date().toISOString(),
      empresas,
      compradores,
      matches,
      actas,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `fade-backup-${payload.date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const yearOptions = useMemo(() => {
    const years = new Set()
    const now = TODAY.getFullYear()
    for (let y = now; y >= now - 5; y--) years.add(y)
    return [...years]
  }, [])

  return (
    <div className="space-y-4">
      {/* Config panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 print:hidden">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Configurar informe</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo de informe</label>
            <select
              value={type}
              onChange={e => { setType(e.target.value); setSelectedId('') }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
            >
              <option value="general">Resumen general de cartera</option>
              <option value="mensual">Resumen mensual</option>
              <option value="empresa">Ficha de empresa</option>
              <option value="comprador">Ficha de comprador</option>
            </select>
          </div>

          {type === 'mensual' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mes</label>
                <select value={reportMonth} onChange={e => setReportMonth(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue">
                  {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Año</label>
                <select value={reportYear} onChange={e => setReportYear(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue">
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </>
          )}

          {type === 'empresa' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Empresa</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue">
                <option value="">— Seleccionar —</option>
                {empresas.map(e => <option key={e.id} value={e.id}>{e.nombreComercial || e.nombre}</option>)}
              </select>
            </div>
          )}

          {type === 'comprador' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Comprador</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue">
                <option value="">— Seleccionar —</option>
                {compradores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}

          {['general', 'empresa', 'comprador'].includes(type) && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fade-blue"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  onClick={() => { setDateFrom(''); setDateTo('') }}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 self-end"
                  title="Quitar filtro de fechas"
                >
                  ✕ Quitar fechas
                </button>
              )}
            </>
          )}

          <button
            onClick={() => window.print()}
            disabled={!canGenerate}
            className="px-5 py-2 bg-fade-dark hover:bg-fade-mid text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Export panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 print:hidden">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Exportar datos</h2>
        <p className="text-xs text-gray-400 mb-3">Descarga una copia de seguridad completa con todos los datos actuales.</p>
        <button
          onClick={handleExportBackup}
          className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar backup JSON
        </button>
      </div>

      {/* Preview */}
      {canGenerate && (
        <div className="report-preview bg-white rounded-xl border border-gray-100 shadow-sm p-8 print:shadow-none print:rounded-none print:border-none print:p-0">
          {type === 'general' && (
            <GeneralReport empresas={empresas} compradores={compradores} matches={matches} dateFrom={dateFrom} dateTo={dateTo} />
          )}
          {type === 'mensual' && (
            <MonthlyReport
              empresas={empresas} compradores={compradores}
              matches={matches} actas={actas}
              month={reportMonth} year={reportYear}
            />
          )}
          {type === 'empresa' && selected && (
            <EmpresaReport empresa={selected} matches={matches} compradores={compradores} dateFrom={dateFrom} dateTo={dateTo} />
          )}
          {type === 'comprador' && selected && (
            <CompradorReport comprador={selected} matches={matches} empresas={empresas} dateFrom={dateFrom} dateTo={dateTo} />
          )}
          {(type === 'empresa' || type === 'comprador') && !selected && (
            <p className="text-center text-gray-400 py-12">Selecciona un elemento para ver la previsualización</p>
          )}
        </div>
      )}
    </div>
  )
}
