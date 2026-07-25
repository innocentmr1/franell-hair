// A client can set any Content-Type header it wants on a multipart upload —
// this checks the actual file bytes (magic numbers) match the claimed type,
// so a malicious file can't slip through disguised as an image/video.
const SIGNATURES = [
  { mime: /^image\/jpe?g$/,     check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: /^image\/png$/,       check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: /^image\/gif$/,       check: (b) => b.toString('ascii', 0, 3) === 'GIF' },
  { mime: /^image\/webp$/,      check: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  { mime: /^video\/mp4$/,       check: (b) => b.toString('ascii', 4, 8) === 'ftyp' },
  { mime: /^video\/quicktime$/, check: (b) => ['ftyp', 'moov', 'free', 'mdat', 'wide'].includes(b.toString('ascii', 4, 8)) },
  { mime: /^video\/webm$/,      check: (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
];

const verifyFileType = (buffer, claimedMime) => {
  if (!buffer || buffer.length < 12) return false;
  const sig = SIGNATURES.find((s) => s.mime.test(claimedMime));
  return sig ? sig.check(buffer) : false;
};

module.exports = verifyFileType;
