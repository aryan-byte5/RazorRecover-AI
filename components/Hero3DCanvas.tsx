"use client";

import { useEffect, useRef } from "react";

interface Node3D {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  radius: number;
  color: string;
  label?: string;
}

export default function Hero3DCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse tracking for 3D rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let rotationX = 0;
    let rotationY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      targetRotationY = (x / (width / 2)) * 0.6;
      targetRotationX = (-y / (height / 2)) * 0.6;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Generate 3D Spherical & Core Nodes
    const numNodes = 75;
    const sphereRadius = Math.min(width, height) * 0.38;
    const nodes: Node3D[] = [];

    // Main 5 Core Financial Workflow Nodes
    const coreLabels = ["PAYMENT", "DIAGNOSIS", "CONTEXT", "RECOVERY", "REVENUE"];
    const coreColors = ["#f43f5e", "#38bdf8", "#818cf8", "#c084fc", "#10b981"];

    coreLabels.forEach((label, i) => {
      const theta = (i / coreLabels.length) * Math.PI * 2;
      const phi = Math.PI * 0.5;
      const r = sphereRadius * 0.85;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi) + (i % 2 === 0 ? 30 : -30);
      const z = r * Math.sin(phi) * Math.sin(theta);
      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        radius: 7,
        color: coreColors[i],
        label,
      });
    });

    // Outer Cloud Nodes
    for (let i = 0; i < numNodes; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = sphereRadius * (0.6 + Math.random() * 0.5);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      nodes.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        radius: Math.random() * 2.5 + 1.5,
        color: Math.random() > 0.4 ? "#3b82f6" : "#10b981",
      });
    }

    let angle = 0;

    const render = () => {
      angle += 0.003;
      rotationX += (targetRotationX - rotationX) * 0.05;
      rotationY += (targetRotationY - rotationY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const fov = 350;
      const centerX = width / 2;
      const centerY = height / 2;

      // Rotate nodes in 3D
      const cosA = Math.cos(angle + rotationY);
      const sinA = Math.sin(angle + rotationY);
      const cosB = Math.cos(rotationX);
      const sinB = Math.sin(rotationX);

      const projectedNodes = nodes.map((node) => {
        // Y-axis rotation
        let x1 = node.baseX * cosA - node.baseZ * sinA;
        let z1 = node.baseZ * cosA + node.baseX * sinA;

        // X-axis rotation
        let y1 = node.baseY * cosB - z1 * sinB;
        let z2 = z1 * cosB + node.baseY * sinB;

        const scale = fov / (fov + z2 + sphereRadius * 1.5);
        const x2d = centerX + x1 * scale;
        const y2d = centerY + y1 * scale;

        return {
          x2d,
          y2d,
          z2,
          scale,
          radius: node.radius * scale,
          color: node.color,
          label: node.label,
        };
      });

      // Sort by depth (back to front)
      projectedNodes.sort((a, b) => b.z2 - a.z2);

      // Draw Connections (Lines)
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes[j];
          const dx = p1.x2d - p2.x2d;
          const dy = p1.y2d - p2.y2d;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.25 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes & Badges
      projectedNodes.forEach((p) => {
        // Outer glow for key nodes
        if (p.label) {
          const gradient = ctx.createRadialGradient(p.x2d, p.y2d, 0, p.x2d, p.y2d, p.radius * 3);
          gradient.addColorStop(0, p.color + "99");
          gradient.addColorStop(1, p.color + "00");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x2d, p.y2d, p.radius * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Main Node Sphere
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, Math.max(1, p.radius), 0, Math.PI * 2);
        ctx.fill();

        // Node Label Pill
        if (p.label) {
          ctx.font = `600 ${Math.max(9, Math.round(11 * p.scale))}px Inter, sans-serif`;
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const textWidth = ctx.measureText(p.label).width;
          const padding = 6 * p.scale;
          const rectHeight = 16 * p.scale;
          const rectY = p.y2d - 16 * p.scale;

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.strokeStyle = p.color + "80";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(
            p.x2d - textWidth / 2 - padding,
            rectY - rectHeight / 2,
            textWidth + padding * 2,
            rectHeight,
            4
          );
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#f8fafc";
          ctx.fillText(p.label, p.x2d, rectY);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center pointer-events-none select-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
