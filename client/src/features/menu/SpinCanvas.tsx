import { useEffect, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

/** Draws ONLY frames provided by the official menu/media pipeline. */
export function SpinCanvas({ urls, alt }: { urls: string[]; alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frames = useRef<HTMLImageElement[]>([]);
  const offset = useRef(0);
  const userInteracted = useRef(false);
  const pointer = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);
  const lastInput = useRef(0);
  const zoom = useRef(1);
  const pan = useRef({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState(true);
  const start = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    Promise.all(urls.map(url => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = url;
    }))).then(images => { if (!cancelled) { frames.current = images; setReady(true); } }).catch(() => { if (!cancelled) setReady(false); });
    return () => { cancelled = true; imgs.length = 0; frames.current = []; };
  }, [urls]);

  useEffect(() => {
    if (!ready || !canvas.current) return;
    const el = canvas.current;
    let handle = 0;
    const draw = (time: number) => {
      if (!el.isConnected) return;
      const rect = el.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width * scale));
      const h = Math.max(1, Math.round(rect.height * scale));
      if (el.width !== w || el.height !== h) { el.width = w; el.height = h; }
      const ctx = el.getContext('2d');
      if (ctx && frames.current.length) {
        if (!userInteracted.current || time - lastInput.current > 3500) {
          userInteracted.current = false;
          if (!start.current) start.current = time;
          offset.current = (Math.sin((time - start.current) / 1250) * .45 + .5) * (frames.current.length - 1);
        }
        const img = frames.current[Math.round(offset.current) % frames.current.length];
        const factor = Math.max(w / img.width, h / img.height);
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2 + pan.current.x * scale, h / 2 + pan.current.y * scale);
        ctx.scale(zoom.current, zoom.current);
        ctx.drawImage(img, -img.width * factor / 2, -img.height * factor / 2, img.width * factor, img.height * factor);
        ctx.restore();
      }
      handle = requestAnimationFrame(draw);
    };
    handle = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(handle);
  }, [ready]);

  const touch = () => { userInteracted.current = true; lastInput.current = performance.now(); setHint(false); };
  return (
    <div className="spin-root">
      <canvas ref={canvas} aria-label={alt} role="img" className="spin-canvas"
        onDoubleClick={(event) => {
          touch();
          if (zoom.current > 1) { zoom.current = 1; pan.current = { x: 0, y: 0 }; }
          else { zoom.current = 2.3; const bounds = event.currentTarget.getBoundingClientRect(); pan.current = { x: (bounds.width / 2 - (event.clientX - bounds.left)) * .5, y: (bounds.height / 2 - (event.clientY - bounds.top)) * .5 }; }
        }}
        onPointerDown={(event) => { touch(); pointer.current = { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY }; }}
        onPointerMove={(event) => {
          if (!pointer.current) return;
          const dx = event.clientX - pointer.current.x;
          const dy = event.clientY - pointer.current.y;
          const horizontal = Math.abs(event.clientX - pointer.current.startX) > Math.abs(event.clientY - pointer.current.startY) * 1.25;
          if (horizontal || zoom.current > 1) {
            if (zoom.current > 1) pan.current = { x: pan.current.x + dx, y: pan.current.y + dy };
            else offset.current = (offset.current + dx * .22 + frames.current.length * 10) % frames.current.length;
            touch();
          }
          pointer.current.x = event.clientX; pointer.current.y = event.clientY;
        }}
        onPointerUp={() => { pointer.current = null; }}
        onPointerCancel={() => { pointer.current = null; }} />
      {hint && <span className="spin-hint"><MoveHorizontal size={14}/> Desliza para girar · doble toque para acercar</span>}
      {!ready && <span className="spin-loading">Preparando vista interactiva…</span>}
    </div>
  );
}
