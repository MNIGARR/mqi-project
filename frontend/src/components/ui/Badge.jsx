const TONES = {
  Handmade: 'bg-pink/10 text-pink-dark border-pink/30',
  Food: 'bg-orange/10 text-orange-dark border-orange/30',
  Clothing: 'bg-purple/10 text-purple-dark border-purple/30',
  Workshops: 'bg-ink/10 text-ink border-ink/25',
}

export default function Badge({ label }) {
  const tone = TONES[label] || 'bg-ink/10 text-ink border-ink/25'
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-mono uppercase tracking-wide ${tone}`}
    >
      {label}
    </span>
  )
}