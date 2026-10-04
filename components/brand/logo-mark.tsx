export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="synapse-logo-gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>

      <g fill="none" stroke="url(#synapse-logo-gradient)" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <path d="M20 21 Q14 15 10 9" />
        <path d="M20 21 Q26 16 31 11" />
        <path d="M20 21 Q13 26 8 30" />
        <path d="M20 21 Q26 27 30 31" />
      </g>

      <circle cx="20" cy="21" r="5.5" fill="url(#synapse-logo-gradient)" />
      <circle cx="10" cy="9" r="3" fill="url(#synapse-logo-gradient)" />
      <circle cx="31" cy="11" r="3.4" fill="url(#synapse-logo-gradient)" />
      <circle cx="8" cy="30" r="2.8" fill="url(#synapse-logo-gradient)" />
      <circle cx="30" cy="31" r="3.2" fill="url(#synapse-logo-gradient)" />
    </svg>
  );
}
