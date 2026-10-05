import { useEffect, useRef, useState } from 'react';
import { MediaItem } from './types';

// A per-item seed keeps the organic arrangement stable across renders and resizes.
function randomFor(key: string) {
  let seed = 2166136261;
  for (const character of key) seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  return () => {
    seed += 0x6D2B79F5;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export default function MementoFrame({ media }: { media: MediaItem }) {
  const hoverRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const surface = hoverRef.current;
    const paper = figureRef.current;
    if (!surface || !paper || media.type !== 'image') return;
    const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const position = [0, 0, 0, 0];
    const velocity = [0, 0, 0, 0];
    const target = [0, 0, 0, 0];
    let frame = 0;
    let lastTime = 0;
    let previous: { x: number; y: number } | null = null;
    const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000 || 1 / 60, 1 / 30);
      lastTime = time;
      let moving = false;
      for (let axis = 0; axis < position.length; axis++) {
        // A damped spring gives each directional push a small, natural recoil.
        velocity[axis] += ((target[axis] - position[axis]) * 150 - velocity[axis] * 15) * dt;
        position[axis] += velocity[axis] * dt;
        if (Math.abs(target[axis] - position[axis]) > 0.005 || Math.abs(velocity[axis]) > 0.005) moving = true;
      }
      if (!moving) position.splice(0, 4, ...target);
      paper.style.transform = `translateY(${position[3]}px) rotateX(${position[0]}deg) rotateY(${position[1]}deg) rotateZ(${position[2]}deg)`;
      frame = moving ? requestAnimationFrame(animate) : 0;
    };
    const start = () => {
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(animate);
      }
    };
    const move = (event: PointerEvent) => {
      if (!motion.matches || event.pointerType !== 'mouse') return;
      // Measure the stationary wrapper, never the rotating paper.
      const bounds = surface.getBoundingClientRect();
      const x = clamp((event.clientX - bounds.left) / Math.max(bounds.width, 1) * 2 - 1, 1);
      const y = clamp((event.clientY - bounds.top) / Math.max(bounds.height, 1) * 2 - 1, 1);
      target.splice(0, 4, -y * 4, x * 4, x * 0.7, -3);
      if (previous) {
        const dx = clamp(x - previous.x, 0.25);
        const dy = clamp(y - previous.y, 0.25);
        velocity[0] = clamp(velocity[0] - dy * 30, 24);
        velocity[1] = clamp(velocity[1] + dx * 30, 24);
        velocity[2] = clamp(velocity[2] + dx * 8, 8);
      }
      previous = { x, y };
      surface.dataset.active = 'true';
      start();
    };
    const leave = () => {
      previous = null;
      target.fill(0);
      delete surface.dataset.active;
      start();
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = null;
      position.fill(0);
      velocity.fill(0);
      target.fill(0);
      paper.style.removeProperty('transform');
      delete surface.dataset.active;
    };
    surface.addEventListener('pointerenter', move);
    surface.addEventListener('pointermove', move);
    surface.addEventListener('pointerleave', leave);
    surface.addEventListener('pointercancel', leave);
    motion.addEventListener('change', reset);
    window.addEventListener('blur', reset);
    return () => {
      reset();
      surface.removeEventListener('pointerenter', move);
      surface.removeEventListener('pointermove', move);
      surface.removeEventListener('pointerleave', leave);
      surface.removeEventListener('pointercancel', leave);
      motion.removeEventListener('change', reset);
      window.removeEventListener('blur', reset);
    };
  }, [media.type]);

  useEffect(() => {
    const figure = figureRef.current;
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!figure || !canvas || !image || !dimensions) return;

    const sample = document.createElement('canvas');
    sample.width = sample.height = 64;
    const sampleContext = sample.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return;
    let pixels: Uint8ClampedArray;
    try {
      sampleContext.drawImage(image, 0, 0, 64, 64);
      pixels = sampleContext.getImageData(0, 0, 64, 64).data;
    } catch {
      // Remote images without CORS permission still display, without invented colors.
      return;
    }

    const draw = () => {
      const random = randomFor(media.id);
      // Layout dimensions stay accurate even while the paper is tilted on hover.
      const bounds = { width: figure.clientWidth, height: figure.clientHeight };
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(bounds.width * ratio);
      canvas.height = Math.round(bounds.height * ratio);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.scale(ratio, ratio);
      const left = image.offsetLeft;
      const top = image.offsetTop;
      const width = image.offsetWidth;
      const height = image.offsetHeight;
      const margin = Math.max(8, left);

      // Clip to the paper around the photo; the caption and original pixels stay clear.
      context.beginPath();
      context.rect(0, 0, bounds.width, top + height + margin * 0.65);
      context.rect(left, top, width, height);
      context.clip('evenodd');

      const clusters = 3 + Math.floor(random() * 4);
      for (let cluster = 0; cluster < clusters; cluster++) {
        const edge = Math.floor(random() * 4);
        const along = random();
        const anchorX = edge === 0 ? left : edge === 1 ? left + width : left + along * width;
        const anchorY = edge === 2 ? top : edge === 3 ? top + height : top + along * height;
        const spread = margin * (0.8 + random() * 1.8);
        for (let speck = 0; speck < 150; speck++) {
          const angle = random() * Math.PI * 2;
          const distance = Math.pow(random(), 1.7) * spread;
          const x = anchorX + Math.cos(angle) * distance;
          const y = anchorY + Math.sin(angle) * distance;
          const pixel = Math.floor(random() * 64 * 64) * 4;
          if (pixels[pixel + 3] < 32) continue;
          context.fillStyle = `rgba(${pixels[pixel]}, ${pixels[pixel + 1]}, ${pixels[pixel + 2]}, ${(0.25 + random() * 0.65) * pixels[pixel + 3] / 255})`;
          const radius = (0.2 + Math.pow(random(), 3) * 2.2) * Math.min(1.3, margin / 24);
          const vertices = 3 + Math.floor(random() * 5);
          context.beginPath();
          for (let vertex = 0; vertex < vertices; vertex++) {
            const direction = angle + vertex / vertices * Math.PI * 2;
            const length = radius * (0.4 + random());
            const px = x + Math.cos(direction) * length;
            const py = y + Math.sin(direction) * length;
            if (vertex === 0) context.moveTo(px, py);
            else context.lineTo(px, py);
          }
          context.closePath();
          context.fill();
        }
      }
    };
    const observer = new ResizeObserver(draw);
    observer.observe(figure);
    draw();
    return () => observer.disconnect();
  }, [media.id, dimensions]);

  return (
    <div ref={hoverRef} className={media.type === 'image' ? 'memento-paper-hover' : undefined}>
    <figure ref={figureRef} className="frame-memento memento-print">
      <canvas ref={canvasRef} className="memento-splashes" aria-hidden="true" />
      {media.type === 'image' ? (
        <img ref={imageRef} src={media.url} alt={media.name} className="memento-media"
          onLoad={event => setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} />
      ) : (
        <video src={media.url} controls autoPlay className="memento-media"
          onLoadedMetadata={event => setDimensions({ width: event.currentTarget.videoWidth, height: event.currentTarget.videoHeight })} />
      )}
      <figcaption className="memento-details">
        <div className="memento-name" title={media.name}>{media.name}</div>
        <div className="memento-metadata">{media.type === 'image' ? 'Image' : 'Video'}{dimensions && ` · ${dimensions.width} × ${dimensions.height} px`}</div>
        {media.description && <p className="memento-description">{media.description}</p>}
      </figcaption>
    </figure>
    </div>
  );
}
