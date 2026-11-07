import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// Reuse the editable original monogram rather than redrawing a raster screenshot.
const footer = await readFile(new URL('../src/components/ContactFooter.tsx', import.meta.url), 'utf8')
const paths = ['signature-main', 'signature-pressure'].map(name => {
  const d = footer.match(new RegExp('className="'+name+'"[^>]* d="([^"]+)"'))?.[1]
  if (!d) throw new Error('Missing original signature path: '+name)
  return '<path d="'+d+'"/>'
}).join('')
const shape = '<g fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">'+paths+'</g>'
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 28 563 185"><style>svg{color:#111110}@media(prefers-color-scheme:dark){svg{color:#F2F0EB}}</style>'+shape+'</svg>\n'
await writeFile(new URL('../src/assets/favicon.svg', import.meta.url), svg)
const raster = '<svg xmlns="http://www.w3.org/2000/svg" width="563" height="185" viewBox="18 28 563 185" style="color:#111110">'+shape+'</svg>'
for (const [size, name] of [[32,'favicon-32.png'],[192,'favicon-192.png'],[180,'apple-touch-icon.png']]) {
  await sharp(Buffer.from(raster)).resize(size,size,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(fileURLToPath(new URL('../src/assets/'+name,import.meta.url)))
}
