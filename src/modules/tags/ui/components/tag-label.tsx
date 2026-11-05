// An SVG attribute rather than a style: the color is user data, and the CSP allows no inline styles.
export function TagDot({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3 shrink-0 stroke-foreground/40">
      <circle cx="6" cy="6" r="5" fill={color} />
    </svg>
  );
}

export function TagLabel({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <TagDot color={color} />
      <span className="wrap-anywhere">{name}</span>
    </span>
  );
}
