import { toPng } from 'html-to-image'

export async function downloadNodeAsPng(node: HTMLElement, filename: string) {
  if (document.fonts?.ready) {
    await document.fonts.ready
  }
  const dataUrl = await toPng(node, { pixelRatio: 2 })
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
