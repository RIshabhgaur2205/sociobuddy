import { useState, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Interactive3DCardProps {
  children: ReactNode;
  className?: string;
  glareEnabled?: boolean;
  tiltAmount?: number;
}

export default function Interactive3DCard({
  children,
  className,
  glareEnabled = true,
  tiltAmount = 15,
}: Interactive3DCardProps) {
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * tiltAmount;
    const rotateX = ((centerY - y) / centerY) * tiltAmount;

    setTransform({ rotateX, rotateY });
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0 });
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative transition-transform duration-200 ease-out cursor-pointer",
        className
      )}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) ${isHovered ? "scale(1.02)" : "scale(1)"}`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}
      
      {/* Glare effect */}
      {glareEnabled && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
          }}
        />
      )}
      
      {/* Shadow that moves with tilt */}
      <div
        className="absolute -z-10 inset-0 rounded-3xl transition-all duration-200"
        style={{
          transform: `translateZ(-50px) translateX(${transform.rotateY * 0.5}px) translateY(${-transform.rotateX * 0.5}px)`,
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(255, 107, 157, 0.15)"
            : "0 10px 30px -10px rgba(0, 0, 0, 0.1)",
        }}
      />
    </div>
  );
}
