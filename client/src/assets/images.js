import img0 from './WhatsApp Image 2026-06-05 at 11.11.08.jpeg'
import img1 from './WhatsApp Image 2026-06-05 at 11.11.08 (1).jpeg'
import img2 from './WhatsApp Image 2026-06-05 at 11.11.08 (2).jpeg'
import img3 from './WhatsApp Image 2026-06-05 at 11.11.09.jpeg'
import img4 from './WhatsApp Image 2026-06-05 at 11.11.09 (1).jpeg'
import img5 from './WhatsApp Image 2026-06-05 at 11.11.09 (2).jpeg'
import img6 from './WhatsApp Image 2026-06-05 at 11.11.09 (3).jpeg'
import img7 from './WhatsApp Image 2026-06-05 at 11.11.09 (4).jpeg'
import img8 from './WhatsApp Image 2026-06-05 at 11.11.09 (5).jpeg'

export const LOCAL_IMAGES = [img0, img1, img2, img3, img4, img5, img6, img7, img8]

// Resolves "local:N" tokens to the actual imported asset URL.
// Falls through for normal http/https URLs unchanged.
export function resolveImg(url) {
  if (!url) return null
  const m = url.match(/^local:(\d+)$/)
  if (m) return LOCAL_IMAGES[+m[1]] ?? null
  return url
}
