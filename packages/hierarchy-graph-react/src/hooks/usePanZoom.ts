import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react';

export type CameraState = {
  x: number;
  y: number;
  scale: number;
};

type UsePanZoomOptions = {
  camera?: CameraState;
  initialCamera?: CameraState;
  minScale?: number;
  maxScale?: number;
  zoomSpeed?: number;
  onCameraChange?: (camera: CameraState) => void;
};

const DEFAULT_CAMERA: CameraState = { x: 0, y: 0, scale: 1 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function usePanZoom(options: UsePanZoomOptions = {}) {
  const {
    camera: controlledCamera,
    initialCamera = DEFAULT_CAMERA,
    minScale = 0.2,
    maxScale = 4,
    zoomSpeed = 0.001,
    onCameraChange,
  } = options;

  const [uncontrolledCamera, setUncontrolledCamera] = useState<CameraState>(initialCamera);
  const camera = controlledCamera ?? uncontrolledCamera;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<CameraState>(camera);
  const panStartRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    originScale: number;
  } | null>(null);
  const [isPanning, setIsPanning] = useState(false);

  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const setCamera = useCallback(
    (next: CameraState | ((prev: CameraState) => CameraState)) => {
      const resolved = typeof next === 'function' ? next(cameraRef.current) : next;
      if (controlledCamera) {
        onCameraChange?.(resolved);
        return;
      }
      setUncontrolledCamera(resolved);
      onCameraChange?.(resolved);
    },
    [controlledCamera, onCameraChange],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!panStartRef.current) return;
      const { startX, startY, originX, originY, originScale } = panStartRef.current;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      setCamera({ x: originX + dx, y: originY + dy, scale: originScale });
    },
    [setCamera],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, [setIsPanning]);

  useEffect(() => {
    if (!isPanning) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isPanning]);

  const onMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      const current = cameraRef.current;
      panStartRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: current.x,
        originY: current.y,
        originScale: current.scale,
      };
      setIsPanning(true);
    },
    [setIsPanning],
  );

  const onWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      event.preventDefault();

      const { left, top } = containerRef.current.getBoundingClientRect();
      const offsetX = event.clientX - left;
      const offsetY = event.clientY - top;

      const current = cameraRef.current;
      const zoomFactor = Math.exp(-event.deltaY * zoomSpeed);
      const nextScale = clamp(current.scale * zoomFactor, minScale, maxScale);

      if (nextScale === current.scale) return;

      const worldX = (offsetX - current.x) / current.scale;
      const worldY = (offsetY - current.y) / current.scale;

      const nextX = offsetX - worldX * nextScale;
      const nextY = offsetY - worldY * nextScale;

      setCamera({ x: nextX, y: nextY, scale: nextScale });
    },
    [maxScale, minScale, setCamera, zoomSpeed],
  );

  return { camera, setCamera, containerRef, onMouseDown, onWheel, isPanning };
}
