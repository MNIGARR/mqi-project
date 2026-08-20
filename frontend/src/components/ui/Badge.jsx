const TONES = {
  Handmade: 'bg-marigold/15 text-marigold-dark border-marigold/30',
  Food: 'bg-teal/10 text-teal-dark border-teal/30',
  Clothing: 'bg-plum/10 text-plum-dark border-plum/30',
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
