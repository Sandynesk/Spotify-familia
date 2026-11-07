// Uso: node corners.cjs <projeto-com-sharp> <imagem.png> <saida-overlay.png> [minArea]
// Detecta telas magenta (#FF00FF) e devolve os 4 cantos (TL, TR, BR, BL) de cada uma,
// ajustando uma reta a cada borda (ignorando os cantos arredondados) e intersectando-as.
const path = require('path')
const { createRequire } = require('module')
const [, , projectDir, imgPath, outPath, minAreaArg] = process.argv
const sharp = createRequire(path.join(projectDir, 'package.json'))('sharp')
const MIN_AREA = Number(minAreaArg || 4000)

const isMagenta = (r, g, b) => r > 170 && b > 170 && g < 110 && Math.abs(r - b) < 90

function fitLine(pts) {
  // y = a*x + b por mínimos quadrados (x = coordenada livre)
  const n = pts.length
  let sx = 0, sy = 0, sxx = 0, sxy = 0
  for (const [x, y] of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y }
  const a = (n * sxy - sx * sy) / (n * sxx - sx * sx)
  return { a, b: (sy - a * sx) / n }
}

;(async () => {
  const { data, info } = await sharp(imgPath).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const mask = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) mask[i] = isMagenta(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) ? 1 : 0

  // componentes conexos (4-vizinhança)
  const label = new Int32Array(W * H)
  const comps = []
  for (let s = 0; s < W * H; s++) {
    if (!mask[s] || label[s]) continue
    const id = comps.length + 1
    const stack = [s]
    label[s] = id
    const px = []
    while (stack.length) {
      const p = stack.pop()
      px.push(p)
      const x = p % W, y = (p / W) | 0
      for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) {
        if (q >= 0 && mask[q] && !label[q]) { label[q] = id; stack.push(q) }
      }
    }
    comps.push({ id, px })
  }

  const screens = []
  for (const c of comps.filter((c) => c.px.length >= MIN_AREA).sort((a, b) => b.px.length - a.px.length)) {
    // PCA para achar o eixo longo da tela
    let mx = 0, my = 0
    for (const p of c.px) { mx += p % W; my += (p / W) | 0 }
    mx /= c.px.length; my /= c.px.length
    let cxx = 0, cyy = 0, cxy = 0
    for (const p of c.px) { const dx = (p % W) - mx, dy = ((p / W) | 0) - my; cxx += dx * dx; cyy += dy * dy; cxy += dx * dy }
    const theta = 0.5 * Math.atan2(2 * cxy, cxx - cyy) // ângulo do eixo principal (longo)
    // frame local: v ao longo do eixo longo, u perpendicular
    const ev = [Math.cos(theta), Math.sin(theta)]
    const eu = [-Math.sin(theta), Math.cos(theta)]
    const boundary = []
    for (const p of c.px) {
      const x = p % W, y = (p / W) | 0
      const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1 ||
        label[p - 1] !== c.id || label[p + 1] !== c.id || label[p - W] !== c.id || label[p + W] !== c.id
      if (edge) boundary.push([(x - mx) * eu[0] + (y - my) * eu[1], (x - mx) * ev[0] + (y - my) * ev[1]])
    }
    const us = boundary.map((b) => b[0]), vs = boundary.map((b) => b[1])
    const umin = Math.min(...us), umax = Math.max(...us), vmin = Math.min(...vs), vmax = Math.max(...vs)
    const inMid = (val, lo, hi) => val > lo + 0.18 * (hi - lo) && val < hi - 0.18 * (hi - lo)
    // bordas: por faixa de v, menor/maior u (laterais); por faixa de u, menor/maior v (topo/base)
    const left = new Map(), right = new Map(), top = new Map(), bot = new Map()
    // Cada ponto só concorre pela borda da sua metade; faixas de 4px garantem amostras em todas as faixas.
    const BIN = 4
    const umid = (umin + umax) / 2, vmid = (vmin + vmax) / 2
    const keep = (map, k, val, better) => { if (!map.has(k) || better(val, map.get(k)[1])) map.set(k, [k, val]) }
    for (const [u, v] of boundary) {
      if (inMid(v, vmin, vmax)) {
        const k = Math.round(v / BIN)
        if (u < umid) keep(left, k, u, (a, b) => a < b)
        else keep(right, k, u, (a, b) => a > b)
      }
      if (inMid(u, umin, umax)) {
        const k = Math.round(u / BIN)
        if (v < vmid) keep(top, k, v, (a, b) => a < b)
        else keep(bot, k, v, (a, b) => a > b)
      }
    }
    const pts = (map) => [...map.values()].map(([k, val]) => [k * BIN, val])
    const L = fitLine(pts(left))   // u = a v + b
    const R = fitLine(pts(right))
    const T = fitLine(pts(top))    // v = a u + b
    const B = fitLine(pts(bot))
    const meet = (side, end) => {
      // u = side.a v + side.b ; v = end.a u + end.b
      const v = (end.a * side.b + end.b) / (1 - end.a * side.a)
      const u = side.a * v + side.b
      return [mx + u * eu[0] + v * ev[0], my + u * eu[1] + v * ev[1]]
    }
    let quad = [meet(L, T), meet(R, T), meet(R, B), meet(L, B)]
    // orientação: "topo" da tela = extremidade com menor y na imagem
    const yTop = (quad[0][1] + quad[1][1]) / 2, yBot = (quad[2][1] + quad[3][1]) / 2
    if (yTop > yBot) quad = [quad[2], quad[3], quad[0], quad[1]]
    // TL deve estar à esquerda de TR (no sentido da tela)
    const cross = (quad[1][0] - quad[0][0]) * (quad[3][1] - quad[0][1]) - (quad[1][1] - quad[0][1]) * (quad[3][0] - quad[0][0])
    if (cross < 0) quad = [quad[1], quad[0], quad[3], quad[2]]
    screens.push({ area: c.px.length, corners: quad.map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]) })
  }

  // overlay de verificação: linhas verdes nos quads detectados
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${screens
    .map((s, i) => `<polygon points="${s.corners.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#00ff66" stroke-width="2"/>` +
      `<text x="${s.corners[0][0] + 6}" y="${s.corners[0][1] + 22}" fill="#00ff66" font-size="22" font-family="monospace">${i}</text>` +
      s.corners.map((p, j) => `<circle cx="${p[0]}" cy="${p[1]}" r="${j === 0 ? 7 : 4}" fill="#00ff66"/>`).join(''))
    .join('')}</svg>`
  await sharp(imgPath).composite([{ input: Buffer.from(svg) }]).png().toFile(outPath)
  console.log(JSON.stringify({ image: path.basename(imgPath), width: W, height: H, screens }, null, 1))
})()
