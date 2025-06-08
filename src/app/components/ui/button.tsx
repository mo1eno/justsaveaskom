import React from "react";


interface ButtonProps {
  children: React.ReactNode;
  className?: string; 
  onClick?: () => void;
}

export function Button({ children, className, onClick }: ButtonProps) {
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}
