
import React from "react";

export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`border rounded-lg shadow p-4 ${className || ""}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={className}>{children}</div>;
}
