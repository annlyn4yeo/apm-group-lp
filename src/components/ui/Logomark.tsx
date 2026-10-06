type LogomarkProps = {
  className?: string;
};

/**
 * Registration-mark brand mark: a corner bracket plus a crosshair, the way
 * a technical drawing or blueprint marks an alignment point. Reinforces
 * the "structural / engineered" visual language — geometric, hard-edged,
 * no curves.
 */
export function Logomark({ className }: LogomarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 9V3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M21 15V21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M12 8V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
      <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}
