import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import '../UIUXPro.css';

// ── Interactive Particle Background (Pure Canvas — no Three.js needed) ──
const InteractiveBackground = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const particles = useRef([]);
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create particles
    const COUNT = 120;
    const pts = [];
    for (let i = 0; i < COUNT; i++) {
      pts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2 + 1,
        color: ['#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
      });
    }
    particles.current = pts;

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.8;
          p.vy += (dy / dist) * force * 0.8;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Wrap edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < pts.length; j++) {
          const p2 = pts[j];
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - d / 120) * 0.25;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Moving gradient orbs
      const t = Date.now() * 0.001;
      const drawOrb = (cx, cy, radius, color) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.12;
        ctx.fill();
        ctx.globalAlpha = 1;
      };
      drawOrb(w * 0.2 + Math.sin(t * 0.3) * 100, h * 0.3 + Math.cos(t * 0.4) * 80, 250, '#3b82f6');
      drawOrb(w * 0.8 + Math.cos(t * 0.5) * 120, h * 0.7 + Math.sin(t * 0.3) * 100, 300, '#8b5cf6');
      drawOrb(w * 0.5 + Math.sin(t * 0.2) * 80, h * 0.5 + Math.cos(t * 0.6) * 60, 200, '#ef4444');

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pro-bg-canvas" />;
};

// ── Custom Cursor ──
const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let hovering = false;
    const move = (e) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.08, overwrite: true });
      gsap.to(ring, { x: e.clientX, y: e.clientY, duration: 0.25, overwrite: true });
    };
    const over = (e) => {
      const t = e.target;
      const hit = t.tagName === 'BUTTON' || t.tagName === 'A' || t.closest('button') || t.closest('a') || t.classList.contains('nav-link') || t.classList.contains('clickable');
      if (hit && !hovering) {
        hovering = true;
        gsap.to(dot, { scale: 2.5, duration: 0.3 });
        gsap.to(ring, { scale: 1.6, opacity: 0.5, duration: 0.3 });
      } else if (!hit && hovering) {
        hovering = false;
        gsap.to(dot, { scale: 1, duration: 0.3 });
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.3 });
      }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor" />
      <div ref={ringRef} className="custom-cursor-outline" />
    </>
  );
};

// ── Magnetic Wrapper (exported) ──
export const Magnetic = ({ children, strength = 0.4 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      gsap.to(el, {
        x: (e.clientX - (left + width / 2)) * strength,
        y: (e.clientY - (top + height / 2)) * strength,
        duration: 0.6,
        ease: 'power3.out',
      });
    };
    const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1,0.3)' });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => {
      el.removeEventListener('mousemove', move);
      el.removeEventListener('mouseleave', leave);
    };
  }, [strength]);

  return <div ref={ref} className="magnetic-wrap">{children}</div>;
};

// ── Main Provider ──
const UIUXProProvider = ({ children }) => {
  return (
    <>
      <div className="noise-overlay" />
      <CustomCursor />
      <InteractiveBackground />
      {children}
    </>
  );
};

export default UIUXProProvider;
