import React from "react";

export function Input({ type, className }: { type: string; className?: string }) {
  return <input type={type} className={`border p-2 rounded ${className}`} />;
}
