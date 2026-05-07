import { SVGProps } from "react";

const baseClass = "h-5 w-5 flex-shrink-0";

export function LogoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <rect x="3" y="4" width="18" height="16" rx="4" />
      <path d="M7 9h10" />
      <path d="M7 13h10" />
      <path d="M7 17h6" />
    </svg>
  );
}

export function DashboardIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function GradesIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <path d="M6 4h12v16H6z" />
      <path d="M6 8h12" />
      <path d="M9 12h6" />
    </svg>
  );
}

export function ProfileIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

export function ChatIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <path d="M4 4h16v12H7l-3 3V4z" />
      <path d="M8 8h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

export function BrainIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <path d="M12 21c-4.418 0-8-3.582-8-8 0-2.352 1.046-4.46 2.714-5.926C7.518 5.25 9.672 4 12 4s4.482 1.25 5.286 3.074C18.954 8.54 20 10.648 20 13c0 4.418-3.582 8-8 8z" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

export function CalendarIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 9h18" />
    </svg>
  );
}

export function CheckIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function TrendingUpIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

export function TrendingDownIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${baseClass} ${className ?? ""}`.trim()}
      {...props}
    >
      <path d="M3 7l6 6 4-4 8 8" />
      <path d="M14 17h7V10" />
    </svg>
  );
}
