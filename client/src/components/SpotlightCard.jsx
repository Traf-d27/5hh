import React, { useRef } from "react";

/**
 * SpotlightCard
 * Premium card container with cursor-following radial spotlight glow.
 * Optimized with direct CSS variable mutations (zero React re-renders).
 */
export function SpotlightCard({ 
  children, 
  className = "", 
  spotlightColor = "rgba(16, 185, 129, 0.12)", 
  onClick,
  ...props 
}) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`group relative overflow-hidden transition-all duration-200 interactive-card ${className}`}
      style={{
        "--spotlight-color": spotlightColor,
      }}
      {...props}
    >
      {/* Soft Cursor Spotlight Glow */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-[inherit] z-10"
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--spotlight-color), transparent 75%)`
        }}
      />
      {children}
    </div>
  );
}
