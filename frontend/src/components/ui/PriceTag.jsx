export default function PriceTag({ price, suffix }) {
  return (
    <span className="pin-tag inline-flex items-center rounded-sm bg-ink text-paper px-3 py-1.5 font-mono text-sm">
      ${Number(price).toFixed(2)}
      {suffix && <span className="ml-1 opacity-70">{suffix}</span>}
    </span>
  )
}
