import { useEffect, useRef } from "react";

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Dynamic resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize 35 particles with soft light blue & gray
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      pulseDirection: number;
      colorType: "blue" | "gray";
    }> = [];

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8, // 0.8 to 2.8px
        vx: (Math.random() - 0.5) * 0.1, // extremely slow drifting
        vy: (Math.random() - 0.5) * 0.1,
        alpha: Math.random() * 0.3 + 0.1, // 10% to 40% opacity
        pulseDirection: Math.random() > 0.5 ? 0.003 : -0.003,
        colorType: Math.random() > 0.6 ? "blue" : "gray"
      });
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Render clean minimalist light particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Soft pulse effect
        p.alpha += p.pulseDirection;
        if (p.alpha > 0.5) {
          p.alpha = 0.5;
          p.pulseDirection = -0.002;
        } else if (p.alpha < 0.05) {
          p.alpha = 0.05;
          p.pulseDirection = 0.002;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Soft blue and neutral gray colors appropriate for Clean Minimalism
        if (p.colorType === "blue") {
          ctx.fillStyle = `rgba(0, 122, 255, ${p.alpha})`;
        } else {
          ctx.fillStyle = `rgba(142, 142, 147, ${p.alpha})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Light aesthetic iOS fluid blurs to create the "Comparison Engine" gradient layout atmosphere */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#007AFF] opacity-[0.03] filter blur-[100px] animate-[pulse_10s_infinite]" />
      <div className="absolute -bottom-40 right-10 w-120 h-120 rounded-full bg-[#5856D6] opacity-[0.03] filter blur-[120px] animate-[pulse_12s_infinite]" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-[#34C759] opacity-[0.02] filter blur-[90px]" />
      
      {/* Film grain texture */}
      <div className="grain-overlay" />
      
      {/* Interactive canvas layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />
    </div>
  );
}
