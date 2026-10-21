"use client";

// The animated galaxy behind every page (HUD look, 2026-10-20). Stars in three
// depth layers shift with the mouse (parallax), nebula clouds drift slowly, and
// a soft glow follows the cursor. On touch screens the stars drift on their
// own. Colors come from theme.css (--galaxy-*). Kept light on purpose: fewer
// stars on small screens, paused when the tab is hidden, still when the
// device asks for reduced motion, never printed.
import { useEffect, useRef } from "react";

interface Star { x: number; y: number; layer: number; size: number; alpha: number; phase: number; speed: number }

const LAYERS = [0.25, 0.55, 1]; // depth: how far each layer moves with the mouse
const PARALLAX_PX = 28;

function cssVar(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const colors = {
      star: cssVar("--galaxy-star", "#ffffff"),
      tint: cssVar("--galaxy-star-tint", "#7df9ff"),
      nebulae: [cssVar("--galaxy-nebula-1", "rgba(88,28,135,0.35)"), cssVar("--galaxy-nebula-2", "rgba(14,116,144,0.28)"), cssVar("--galaxy-nebula-3", "rgba(37,99,235,0.18)")],
      glow: cssVar("--galaxy-glow", "rgba(34,211,238,0.10)"),
    };

    let width = 0, height = 0, stars: Star[] = [];
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, seen: false };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(320, Math.round((width * height) / 5500)); // ~120 on a phone
      stars = Array.from({ length: count }, () => {
        const layer = Math.floor(Math.random() * LAYERS.length);
        return {
          x: Math.random(),
          y: Math.random(),
          layer,
          size: 0.4 + layer * 0.45 + Math.random() * 0.5,
          alpha: 0.35 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 1.2,
        };
      });
    }

    function draw(t: number) {
      const time = t / 1000;
      ctx!.clearRect(0, 0, width, height);

      // Nebula clouds, drifting slowly
      const clouds = [
        { x: 0.12 + 0.03 * Math.sin(time * 0.05), y: 0.82 + 0.02 * Math.cos(time * 0.04), r: 0.6 },
        { x: 0.88 + 0.03 * Math.cos(time * 0.045), y: 0.18 + 0.03 * Math.sin(time * 0.05), r: 0.55 },
        { x: 0.55 + 0.04 * Math.sin(time * 0.03), y: 0.5 + 0.03 * Math.cos(time * 0.035), r: 0.45 },
      ];
      clouds.forEach((c, i) => {
        const r = c.r * Math.max(width, height);
        const g = ctx!.createRadialGradient(c.x * width, c.y * height, 0, c.x * width, c.y * height, r);
        g.addColorStop(0, colors.nebulae[i]);
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, width, height);
      });

      // Where the view is "looking": the mouse, or a slow drift on touch screens
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const lookX = hasMouse && mouse.seen ? mouse.x - 0.5 : 0.25 * Math.sin(time * 0.07);
      const lookY = hasMouse && mouse.seen ? mouse.y - 0.5 : 0.25 * Math.cos(time * 0.05);

      for (const s of stars) {
        const depth = LAYERS[s.layer];
        const x = ((s.x * width - lookX * PARALLAX_PX * depth * 2) % width + width) % width;
        const y = ((s.y * height - lookY * PARALLAX_PX * depth * 2) % height + height) % height;
        const twinkle = reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(time * s.speed + s.phase);
        ctx!.globalAlpha = s.alpha * twinkle;
        ctx!.fillStyle = s.layer === 2 && s.phase > 4.5 ? colors.tint : colors.star;
        ctx!.beginPath();
        ctx!.arc(x, y, s.size, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // Soft glow that follows the cursor
      if (hasMouse && mouse.seen && !reduceMotion) {
        const gx = mouse.x * width, gy = mouse.y * height;
        const g = ctx!.createRadialGradient(gx, gy, 0, gx, gy, 220);
        g.addColorStop(0, colors.glow);
        g.addColorStop(1, "transparent");
        ctx!.fillStyle = g;
        ctx!.fillRect(gx - 220, gy - 220, 440, 440);
      }
    }

    let frame = 0;
    const loop = (t: number) => {
      draw(t);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!frame && !reduceMotion && !document.hidden) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.tx = e.clientX / width;
      mouse.ty = e.clientY / height;
      if (!mouse.seen) { mouse.x = mouse.tx; mouse.y = mouse.ty; mouse.seen = true; }
    };
    const onResize = () => { resize(); if (reduceMotion) draw(0); };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    if (reduceMotion) draw(0);
    else start();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="galaxy pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
