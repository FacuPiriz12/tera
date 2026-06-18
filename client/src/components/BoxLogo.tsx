interface BoxLogoProps {
  className?: string;
}

export default function BoxLogo({ className }: BoxLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L3 7v10l9 5 9-5V7L12 2z"
        fill="#0061D5"
      />
      <path
        d="M12 2L3 7l9 5 9-5-9-5z"
        fill="#0075DB"
      />
      <path
        d="M3 7v10l9 5V12L3 7z"
        fill="#004FAC"
      />
      <path
        d="M21 7v10l-9 5V12l9-5z"
        fill="#0061D5"
      />
    </svg>
  );
}
