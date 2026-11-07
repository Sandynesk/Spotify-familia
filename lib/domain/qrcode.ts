import QRCode from 'qrcode'

/** Renderiza o texto em um SVG de QR Code. Cores aceitam CSS/SVG, como `#000`. */
export async function gerarQrSvg(
  texto: string,
  opcoes: { margem?: number; cor?: string; fundo?: string } = {},
): Promise<string> {
  return QRCode.toString(texto, {
    type: 'svg',
    margin: opcoes.margem ?? 2,
    color: { dark: opcoes.cor ?? '#000000', light: opcoes.fundo ?? '#ffffff' },
  })
}
