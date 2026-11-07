import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

function createSvg(size, iconSize, isMaskable = false) {
  const pad = (size - iconSize) / 2
  const scale = iconSize / 48
  const rx = isMaskable ? 0 : Math.round(size * 0.22)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#000000" rx="${rx}" />
    <g transform="translate(${pad}, ${pad}) scale(${scale})">
      <path d="M6.506 19.7L11.529 11L12.799 13.2L9.047 19.7Z" fill="#48E5B2" stroke="#48E5B2" stroke-width="6.6" stroke-linejoin="round"/>
      <path d="M18.977 6.7L29.023 6.7L27.753 8.9L20.247 8.9Z" fill="#48E5B2" stroke="#48E5B2" stroke-width="6.6" stroke-linejoin="round"/>
      <path d="M36.471 11L41.494 19.7L38.953 19.7L35.201 13.2Z" fill="#48E5B2" stroke="#48E5B2" stroke-width="6.6" stroke-linejoin="round"/>
      <path d="M41.494 28.3L36.471 37L35.201 34.8L38.953 28.3Z" fill="#48E5B2" stroke="#48E5B2" stroke-width="6.6" stroke-linejoin="round"/>
      <path d="M29.023 41.3L18.977 41.3L20.247 39.1L27.753 39.1Z" fill="#48E5B2" stroke="#48E5B2" stroke-width="6.6" stroke-linejoin="round"/>
      <path d="M11.529 37L6.506 28.3L9.047 28.3L12.799 34.8Z" fill="#48E5B2" stroke="#48E5B2" stroke-width="6.6" stroke-linejoin="round"/>
    </g>
  </svg>`
}

async function run() {
  const dir = path.resolve('public/icons')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  const tasks = [
    { file: path.join(dir, 'icon-192.png'), size: 192, iconSize: 134, maskable: false },
    { file: path.join(dir, 'icon-512.png'), size: 512, iconSize: 358, maskable: false },
    { file: path.join(dir, 'icon-maskable-192.png'), size: 192, iconSize: 115, maskable: true },
    { file: path.join(dir, 'icon-maskable-512.png'), size: 512, iconSize: 307, maskable: true },
    { file: path.join(dir, 'apple-touch-icon.png'), size: 180, iconSize: 126, maskable: false },
  ]

  for (const t of tasks) {
    const svg = createSvg(t.size, t.iconSize, t.maskable)
    await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(t.file)
    console.log('Generated:', t.file)
  }
}

run()
