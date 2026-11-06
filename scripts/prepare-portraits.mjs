import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const output = new URL('../src/assets/', import.meta.url)
await mkdir(output, { recursive: true })

for (const name of ['image1', 'image2']) {
  const source = new URL('../public/assets/' + name + '.png', import.meta.url)
  const { fileURLToPath } = await import('node:url')
  const image = sharp(fileURLToPath(source))
  const metadata = await image.metadata()
  console.log(name, metadata.width, metadata.height, 'alpha:', metadata.hasAlpha)
  await Promise.all([640, 1080].map(async (width) => {
    const target = new URL(name + '-' + width + '.webp', output)
    const info = await image.clone().resize({ width }).webp({ quality: 87, alphaQuality: 100 })
      .toFile(fileURLToPath(target))
    console.log(target.pathname.split('/').pop(), info.width, info.height, info.size + ' bytes')
  }))
}
