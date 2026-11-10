/**
 * The parish mark: St. Barbara's tower with its three windows, the attribute she is shown with.
 * Drawn in the current text colour.
 */
export default function TowerMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 32"
      fill="currentColor"
      fillRule="evenodd"
      aria-hidden
      className={className}
    >
      <path d="M3 2h4v2.5h3V2h4v2.5h3V2h4v7h-2v21H5V9H3zM10.7 17.5h2.6v-4.2a1.3 1.3 0 0 0-2.6 0zM7.2 25.5h2.6v-4.2a1.3 1.3 0 0 0-2.6 0zM14.2 25.5h2.6v-4.2a1.3 1.3 0 0 0-2.6 0z" />
    </svg>
  );
}
