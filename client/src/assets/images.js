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

// Extract YouTube video ID from any YouTube URL format
function youtubeId(url) {
  if (!url) return null
  const patterns = [
    /\/shorts\/([^?&#/]+)/,
    /youtu\.be\/([^?&#/]+)/,
    /[?&]v=([^&#]+)/,
    /\/embed\/([^?&#/]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

// Resolves "local:N" tokens, YouTube URLs → thumbnail, or passes http URLs through.
export function resolveImg(url) {
  if (!url) return null
  const m = url.match(/^local:(\d+)$/)
  if (m) return LOCAL_IMAGES[+m[1]] ?? null
  // YouTube or youtu.be → use maxresdefault thumbnail
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const id = youtubeId(url)
    if (id) return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
  }
  return url
}
