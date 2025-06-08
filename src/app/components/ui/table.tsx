import React from "react";

export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full border-collapse border border-gray-300">{children}</table>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return <thead className="bg-gray-100">{children}</thead>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return <tr className="border border-gray-300">{children}</tr>;
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return <th className="p-2 border border-gray-300 text-left">{children}</th>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="p-2 border border-gray-300">{children}</td>;
}
