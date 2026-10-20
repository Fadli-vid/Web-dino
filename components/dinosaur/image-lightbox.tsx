'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  MousePointer,
  Hand,
} from 'lucide-react';
import Image from 'next/image';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  imageAlt: string;
  title: string;
  subtitle?: string;
  categoryBadge?: string;
}

export function ImageLightbox({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
  title,
  subtitle,
  categoryBadge = 'SPECIMEN ARCHIVE',
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  // References for mouse drag
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  const dragStartOffsetRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // References for touch interactions
  const touchStartOffsetRef = useRef({ x: 0, y: 0 });
  const isTouchDraggingRef = useRef(false);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchScaleRef = useRef<number>(1);
  const lastTapRef = useRef<number>(0);

  // Reset zoom & pan when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setIsTouchDragging(false);
      hasDraggedRef.current = false;
    }
  }, [isOpen, imageUrl]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(Number((prev + 0.5).toFixed(2)), 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(2)), 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleToggleZoom = useCallback(() => {
    setScale((prev) => {
      if (prev > 1) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  }, []);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Window-level Wheel Event listener for 100% reliable mouse scroll zoom
  useEffect(() => {
    if (!isOpen) return;

    const handleGlobalWheel = (e: WheelEvent) => {
      // Prevent browser zoom or background scrolling
      e.preventDefault();

      const delta = -e.deltaY;
      let change = delta * 0.002;
      // Clamp change to ensure consistent smooth responsiveness across standard mice and trackpads
      if (Math.abs(change) < 0.06 && delta !== 0) {
        change = Math.sign(delta) * 0.06;
      }
      if (Math.abs(change) > 0.35) {
        change = Math.sign(delta) * 0.35;
      }

      setScale((prevScale) => {
        const nextScale = Math.min(Math.max(1, Number((prevScale + change).toFixed(2))), 4);
        if (nextScale <= 1) {
          setPosition({ x: 0, y: 0 });
          return 1;
        }
        return nextScale;
      });
    };

    // Attach to window with passive: false so preventDefault() works without browser warning
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleGlobalWheel);
    };
  }, [isOpen]);

  // Global mousemove & mouseup listeners for buttery smooth left-click dragging anywhere on screen
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      const dist = Math.hypot(
        e.clientX - dragStartPosRef.current.x,
        e.clientY - dragStartPosRef.current.y
      );
      if (dist > 4) {
        hasDraggedRef.current = true;
      }

      setPosition({
        x: e.clientX - dragStartOffsetRef.current.x,
        y: e.clientY - dragStartOffsetRef.current.y,
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Mouse Handlers (Left-click drag to pan when zoomed)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left-click
    e.preventDefault();

    dragStartPosRef.current = { x: e.clientX, y: e.clientY };
    dragStartOffsetRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    hasDraggedRef.current = false;

    if (scale > 1) {
      setIsDragging(true);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // If the user was dragging, do not trigger click toggle
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    if (scale === 1) {
      // Single click on 1x zooms in to 2x
      setScale(2);
    } else {
      // Single click when zoomed resets back to 1x
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleToggleZoom();
  };

  // Mobile Touch Handlers (Pinch-to-zoom, 1-finger drag, 2x tap to zoom)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // 2 fingers: Pinch to zoom
      isTouchDraggingRef.current = false;
      setIsTouchDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistRef.current = dist;
      initialPinchScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      // 1 finger: Check for double tap
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        e.preventDefault();
        handleToggleZoom();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      // If zoomed in, prepare 1-finger pan
      if (scale > 1) {
        isTouchDraggingRef.current = true;
        setIsTouchDragging(true);
        touchStartOffsetRef.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
      // Pinch zooming in progress
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialPinchDistRef.current;
      const nextScale = Math.min(
        Math.max(1, Number((initialPinchScaleRef.current * ratio).toFixed(2))),
        4
      );
      setScale(nextScale);
      if (nextScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && isTouchDraggingRef.current && scale > 1) {
      // 1 finger pan in progress
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - touchStartOffsetRef.current.x,
        y: e.touches[0].clientY - touchStartOffsetRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      initialPinchDistRef.current = null;
    }
    if (e.touches.length === 0) {
      isTouchDraggingRef.current = false;
      setIsTouchDragging(false);
    }
  };

  if (!imageUrl) return null;

  // Ultra high-resolution optimized URL for fullscreen presentation
  const highResUrl = getOptimizedImageUrl(imageUrl, {
    width: 2400,
    quality: 'auto:good',
  });

  const isActivelyDragging = isDragging || isTouchDragging;

  // Dynamic cursor class based on zoom and dragging state
  const getCursorClass = () => {
    if (isDragging) return 'cursor-grabbing';
    if (scale > 1) return 'cursor-grab';
    return 'cursor-zoom-in';
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Deep black cinematic backdrop with blur */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />

        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col justify-between select-none outline-none focus:outline-none"
        >
          {/* Accessible Title */}
          <DialogPrimitive.Title className="sr-only">
            {title} - Fullscreen Specimen Viewer
          </DialogPrimitive.Title>

          {/* Top Control Bar */}
          <div className="relative z-20 flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-gradient-to-b from-black/85 via-black/50 to-transparent">
            {/* Specimen Info */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  {categoryBadge}
                </span>
                {subtitle && (
                  <span className="text-xs italic text-zinc-400 hidden sm:inline">
                    {subtitle}
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold font-[var(--font-display)] text-white tracking-wide truncate mt-0.5">
                {title}
              </h2>
            </div>

            {/* Center: Desktop Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-900/80 border border-zinc-700/60 rounded-xl px-2 py-1 shadow-md backdrop-blur-md">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={scale <= 1}
                className="h-7 w-7 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 rounded-lg"
                title="Zoom Out (Scroll Down / -)"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>

              <span className="text-xs font-mono font-medium text-zinc-300 w-12 text-center">
                {Math.round(scale * 100)}%
              </span>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={scale >= 4}
                className="h-7 w-7 text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-30 rounded-lg"
                title="Zoom In (Scroll Up / +)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              {scale > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleResetZoom}
                  className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg ml-1"
                  title="Reset Zoom (0 / R)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden md:flex h-8 text-xs border-zinc-700/70 bg-zinc-900/60 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl gap-1.5"
              >
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" title="Buka berkas resolusi asli">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Original</span>
                </a>
              </Button>

              <DialogPrimitive.Close asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 rounded-xl border-zinc-700/70 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors shadow-lg"
                  aria-label="Tutup tampilan layar penuh"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Center Image Viewport */}
          <div
            className={`flex-1 flex items-center justify-center overflow-hidden relative p-4 sm:p-8 touch-none select-none ${getCursorClass()}`}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div
              className={`relative w-full h-full max-w-[90vw] max-h-[80vh] flex items-center justify-center ${
                isActivelyDragging ? 'transition-none' : 'transition-transform duration-200 ease-out'
              }`}
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              }}
            >
              <Image
                src={highResUrl}
                alt={imageAlt || title}
                fill
                sizes="95vw"
                className="object-contain pointer-events-none drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Bottom Bar: Instructions & Mobile Controls */}
          <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-xs text-zinc-400 font-mono">
            {/* Desktop Interaction Badges & Hints */}
            <div className="hidden sm:flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <MousePointer className="w-3.5 h-3.5 text-primary" />
                Scroll mouse untuk zoom
              </span>
              <span className="text-zinc-600">·</span>
              <span className={`inline-flex items-center gap-1.5 ${scale > 1 ? 'text-primary font-medium' : 'text-zinc-400'}`}>
                <Hand className="w-3.5 h-3.5" />
                Klik kiri tahan untuk menggeser
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500">
                Klik 2x / tap untuk toggle zoom
              </span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-500">
                ESC untuk tutup
              </span>
            </div>

            {/* Mobile Touch Instructions */}
            <div className="flex sm:hidden items-center justify-between w-full">
              <span className="text-zinc-300 text-[11px] leading-tight">
                Pinch / 2x tap zoom · {scale > 1 ? 'Geser 1 jari untuk pan' : 'Scroll / tap'}
              </span>

              {/* Mobile Quick Action Buttons */}
              <div className="flex items-center gap-1 shrink-0 bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-1.5 py-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomOut();
                  }}
                  disabled={scale <= 1}
                  className="h-6 w-6 text-zinc-300 hover:text-white bg-transparent disabled:opacity-30 rounded"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <span className="text-[10px] font-mono text-zinc-300 min-w-8 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleZoomIn();
                  }}
                  disabled={scale >= 4}
                  className="h-6 w-6 text-zinc-300 hover:text-white bg-transparent disabled:opacity-30 rounded"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>
                {scale > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetZoom();
                    }}
                    className="h-6 w-6 text-zinc-400 hover:text-white bg-transparent rounded ml-0.5"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Right Tag */}
            <span className="text-[11px] text-zinc-500 uppercase tracking-widest hidden sm:inline">
              Ultra-Res Specimen View
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
