interface S3LogoProps {
  className?: string;
}

export default function S3Logo({ className }: S3LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2L4 6v5c0 4.5 3.4 8.7 8 9.9 4.6-1.2 8-5.4 8-9.9V6L12 2z" fill="#FF9900" />
      <path d="M12 2L4 6v5c0 4.5 3.4 8.7 8 9.9V2z" fill="#FF9900" opacity="0.7" />
      <path d="M8.5 11.5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
