// Geometria da marca do SpotiFamília: um anel hexagonal formado por 6 cápsulas iguais
// (as 6 vagas do plano, juntas formando um todo). Vetorial exata — redesenho do conceito A1 gerado por IA.
// Módulo puro (sem React) para servir tanto ao <BrandSymbol> quanto à geração de SVG estático.

export const BRAND_COLORS = {
  accent: '#48E5B2',
} as const

export const BRAND_VIEW = 48
const C = BRAND_VIEW / 2
const OUTER_APOTHEM = 20.6 // distância do centro à face externa de cada cápsula
const INNER_APOTHEM = 11.8 // distância do centro à face interna (buraco do anel)
const GAP = 2 // vão entre cápsulas, medido nos vértices do hexágono
/** raio dos cantos — alto para dar o efeito de cápsula (aplicado via stroke com junção redonda) */
export const BRAND_ROUND = 3.3
/** vértices do hexágono de topo reto, em graus (SVG: 0° = direita, sentido horário) */
const VERTICES = [180, 240, 300, 0, 60, 120]

const rad = (deg: number) => (deg * Math.PI) / 180
const fmt = (n: number) => +n.toFixed(3)

type Line = { nx: number; ny: number; c: number } // n · (p − centro) = c

function meet(a: Line, b: Line): [number, number] {
  const det = a.nx * b.ny - a.ny * b.nx
  const x = (a.c * b.ny - a.ny * b.c) / det
  const y = (a.nx * b.c - a.c * b.nx) / det
  return [C + x, C + y]
}

/**
 * Cápsula do lado entre os vértices v0 → v1: interseção de 4 retas (face externa, face interna
 * e os dois cortes radiais nos vértices), todas recuadas em ROUND para que o stroke arredondado
 * (largura 2·ROUND) devolva o tamanho visual exato com cantos redondos.
 */
function capsulePath(v0: number, v1: number): string {
  const m = rad((v0 + v1) / 2)
  const outer: Line = { nx: Math.cos(m), ny: Math.sin(m), c: OUTER_APOTHEM - BRAND_ROUND }
  const inner: Line = { nx: Math.cos(m), ny: Math.sin(m), c: INNER_APOTHEM + BRAND_ROUND }
  const off = GAP / 2 + BRAND_ROUND
  const cut0: Line = { nx: -Math.sin(rad(v0)), ny: Math.cos(rad(v0)), c: off }
  const cut1: Line = { nx: Math.sin(rad(v1)), ny: -Math.cos(rad(v1)), c: off }
  const pts = [meet(outer, cut0), meet(outer, cut1), meet(inner, cut1), meet(inner, cut0)]
  return `M${pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L')}Z`
}

export const BRAND_CAPSULES: readonly string[] = VERTICES.map((v0, i) => {
  const next = VERTICES[(i + 1) % VERTICES.length]
  return capsulePath(v0, next < v0 ? next + 360 : next)
})

/** SVG autônomo do símbolo (para public/, favicon, app mobile). */
export function brandSymbolSvg(color: string = BRAND_COLORS.accent): string {
  const paths = BRAND_CAPSULES.map(
    (d) => `<path d="${d}" fill="${color}" stroke="${color}" stroke-width="${BRAND_ROUND * 2}" stroke-linejoin="round"/>`,
  ).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BRAND_VIEW} ${BRAND_VIEW}">${paths}</svg>`
}
