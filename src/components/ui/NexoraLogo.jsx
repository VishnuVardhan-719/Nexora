export default function NexoraLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M31 8 L32.2 5.5 L33.4 8 L32.2 10.5 Z" fill="#a8cce8" />
      <circle cx="35" cy="7" r="1.1" fill="#c2ddf0" />
      <circle cx="10" cy="11" r="1" fill="#8ab8d8" opacity="0.8" />
      <polyline
        points="5,37 13,25 21,29 31,15 43,21"
        stroke="#7eb8f5"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
