interface OneDriveLogoProps {
  className?: string;
}

export default function OneDriveLogo({ className }: OneDriveLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.128 5.428A5.994 5.994 0 0 0 8.5 2a6 6 0 0 0-5.473 3.529A4.5 4.5 0 0 0 4 14h3.997v-.001H17.5a3.5 3.5 0 0 0 .628-6.937A5.979 5.979 0 0 0 14.128 5.428z"
        fill="#0078D4"
      />
      <path
        d="M9.5 7.5a4.5 4.5 0 0 1 8.628 1.563A3.5 3.5 0 0 1 17.5 16H8a4 4 0 0 1-.003-8c.166 0 .33.01.493.03A4.502 4.502 0 0 1 9.5 7.5z"
        fill="#1490DF"
      />
    </svg>
  );
}
