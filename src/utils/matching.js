/**
 * Calculates a compatibility score (0-100) between a company and a buyer.
 * Weights: sector 35 | investment range 30 | EBITDA 20 | location 15
 */
export function calculateScore(empresa, comprador) {
  let score = 0

  // 1. Sector match (35 pts)
  if (
    comprador.sectoresInteres?.length > 0 &&
    comprador.sectoresInteres.includes(empresa.sector)
  ) {
    score += 35
  }

  // 2. Valuation within buyer's investment range (30 pts)
  const val = empresa.valoracionSolicitada || 0
  const min = comprador.inversionMin || 0
  const max = comprador.inversionMax || Infinity
  if (val >= min && val <= max) {
    score += 30
  } else if (val > 0 && max > 0) {
    // Partial credit if within 20% of range
    const nearest = val < min ? min : max
    const diff = Math.abs(val - nearest) / nearest
    if (diff <= 0.2) score += 15
  }

  // 3. EBITDA >= buyer minimum (20 pts)
  const ebitda = empresa.ebitda || 0
  const ebitdaMin = comprador.ebitdaMin || 0
  if (ebitda >= ebitdaMin) {
    score += 20
  } else if (ebitdaMin > 0) {
    const diff = Math.abs(ebitda - ebitdaMin) / ebitdaMin
    if (diff <= 0.15) score += 10
  }

  // 4. Location match (15 pts)
  if (
    comprador.provinciaInteres?.length > 0 &&
    comprador.provinciaInteres.includes(empresa.provincia)
  ) {
    score += 15
  } else if (!comprador.provinciaInteres || comprador.provinciaInteres.length === 0) {
    // Buyer has no location preference → neutral (7 pts)
    score += 7
  }

  return Math.min(100, Math.round(score))
}

export function scoreLabel(score) {
  if (score >= 80) return { label: 'Excelente', color: 'green' }
  if (score >= 60) return { label: 'Buena',     color: 'blue'  }
  if (score >= 40) return { label: 'Media',     color: 'yellow'}
  return               { label: 'Baja',         color: 'gray'  }
}

/**
 * Returns all auto-suggested matches (score >= 40) between active companies and buyers.
 */
export function autoMatches(empresas, compradores) {
  const results = []
  for (const emp of empresas) {
    if (['cerrado_exito', 'cerrado_fracaso', 'descartado'].includes(emp.estado)) continue
    for (const comp of compradores) {
      if (['cerrado', 'pausado'].includes(comp.estado)) continue
      const score = calculateScore(emp, comp)
      if (score >= 40) {
        results.push({ empresaId: emp.id, compradorId: comp.id, score })
      }
    }
  }
  return results.sort((a, b) => b.score - a.score)
}
