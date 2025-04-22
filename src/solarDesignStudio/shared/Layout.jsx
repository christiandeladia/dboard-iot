// components/Layout.jsx
import React from "react";


// full‐width centered grid container
export function Container({ children, className = "" }) {
  return (
    <div
      className={`
        md:mt-30
        w-full max-w-10/12 lg:max-w-9/12 mx-auto
        grid grid-cols-1 md:gap-8
        md:grid-cols-2 md:grid-rows-2
        lg:grid-cols-2 lg:grid-rows-2
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// places its children in the “SectionHeader ” cell
export function SectionHeader ({ children, className = "" }) {
  return (
    <div className={`md:col-start-2 md:row-start-1 ${className}`}>
      {children}
    </div>
  );
}

// places its children in the big image cell
export function SectionMedia ({ children, className = "" }) {
  return (
    <div
      className={`
        md:col-start-1 md:row-start-1 md:row-span-2
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// places its children in the “question+buttons” cell
export function SectionContent ({ children, className = "" }) {
  return (
    <div className={`md:col-start-2 md:row-start-2 ${className}`}>
      {children}
    </div>
  );
}
