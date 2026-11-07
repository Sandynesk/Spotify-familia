// Mapeia um retângulo (0,0)-(w,h) para um quadrilátero qualquer via transformação projetiva,
// devolvendo um `matrix3d(...)` CSS. Usado para encaixar telas HTML nas fotos geradas por IA.

export type Point = readonly [number, number]
/** Cantos na ordem: topo-esquerdo, topo-direito, base-direito, base-esquerdo. */
export type Quad = readonly [Point, Point, Point, Point]

/** Resolve A·x = b por eliminação gaussiana com pivotamento parcial. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])
  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
    if (Math.abs(M[pivot][col]) < 1e-12) throw new Error('homography: cantos degenerados')
    ;[M[col], M[pivot]] = [M[pivot], M[col]]
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r][col] / M[col][col]
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

/**
 * Homografia H (3×3, h33 = 1) tal que H·(x, y, 1) ∝ (X, Y, 1) para cada par
 * src[i] → dst[i]. Retorna [h11, h12, h13, h21, h22, h23, h31, h32].
 */
function homography(src: Quad, dst: Quad): number[] {
  const A: number[][] = []
  const b: number[] = []
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i]
    const [X, Y] = dst[i]
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X])
    b.push(X)
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y])
    b.push(Y)
  }
  return solve(A, b)
}

/**
 * CSS `matrix3d` que leva um elemento de `width`×`height` (com `transform-origin: 0 0`)
 * até `corners`, em pixels do mesmo sistema de coordenadas do contêiner.
 */
export function quadToMatrix3d(width: number, height: number, corners: Quad): string {
  const src: Quad = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ]
  const [a, b, c, d, e, f, g, h] = homography(src, corners)
  // matrix3d é column-major: (a, d, 0, g,  b, e, 0, h,  0, 0, 1, 0,  c, f, 0, 1)
  const m = [a, d, 0, g, b, e, 0, h, 0, 0, 1, 0, c, f, 0, 1]
  return `matrix3d(${m.map((v) => +v.toFixed(10)).join(',')})`
}

/** Escala cantos medidos na imagem original para o tamanho renderizado. */
export function scaleQuad(corners: Quad, sx: number, sy: number = sx): Quad {
  return corners.map(([x, y]) => [x * sx, y * sy] as const) as unknown as Quad
}
