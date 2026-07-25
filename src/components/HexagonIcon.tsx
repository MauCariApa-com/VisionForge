import * as React from "react";

interface HexagonIconProps extends React.SVGProps<SVGSVGElement> {}

export function HexagonIcon({ className, ...props }: HexagonIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <polygon points="12,2 22,7.5 22,16.5 12,22 2,16.5 2,7.5" />
    </svg>
  );
}