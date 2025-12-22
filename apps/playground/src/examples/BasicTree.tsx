import { useEffect, useMemo, useRef, useState } from 'react';
import { Graph, type GraphNode, type LayoutEdge, type LayoutNode, useLayout } from 'hierarchy-graph-react';
import { curvePath, straightPath } from '../../../../packages/hierarchy-graph-react/src/core/edgePath';

const nodes: GraphNode<{ label: string }>[] = [
  {
    id: 'root',
    data: { label: 'Root' },
    children: [
      {
        id: 'left',
        data: { label: 'Left' },
        children: [{ id: 'left-child', data: { label: 'Left Child' } }, { id: 'left-child2', data: { label: 'Left Child' }}],
      },
      {
        id: 'right',
        data: { label: 'Right' },
        children: [
          { id: 'right-child-1', data: { label: 'Right Child 1' } },
          { id: 'right-child-2', data: { label: 'Right Child 2' } },
        ],
      },
    ],
  },
];

const directionOptions = ['top-down', 'bottom-up', 'left-right', 'right-left'] as const;
const parentAlignmentOptions = ['first-child', 'center'] as const;
const nodeSize = { width: 120, height: 48 };
const gap = { level: 80, sibling: 40 };
const DEFAULT_CAMERA = { x: 40, y: 40, scale: 1 };
const CAMERA_PADDING = 32;

type Camera = typeof DEFAULT_CAMERA;
type Viewport = { width: number; height: number };

const getFitCamera = (
  layoutNodes: LayoutNode<unknown>[],
  viewport: Viewport,
  fallbackSize: { width: number; height: number },
  padding = CAMERA_PADDING,
): Camera => {
  if (layoutNodes.length === 0 || viewport.width === 0 || viewport.height === 0) {
    return DEFAULT_CAMERA;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of layoutNodes) {
    const width = node.width ?? fallbackSize.width;
    const height = node.height ?? fallbackSize.height;
    minX = Math.min(minX, node.x - width / 2);
    minY = Math.min(minY, node.y - height / 2);
    maxX = Math.max(maxX, node.x + width / 2);
    maxY = Math.max(maxY, node.y + height / 2);
  }

  const boundsWidth = maxX - minX;
  const boundsHeight = maxY - minY;
  const availableWidth = Math.max(viewport.width - padding * 2, 1);
  const availableHeight = Math.max(viewport.height - padding * 2, 1);
  const scaleX = availableWidth / boundsWidth;
  const scaleY = availableHeight / boundsHeight;
  const scale = Math.min(1, scaleX, scaleY);

  if (!Number.isFinite(scale) || scale <= 0) {
    return DEFAULT_CAMERA;
  }

  const x = (viewport.width - boundsWidth * scale) / 2 - minX * scale;
  const y = (viewport.height - boundsHeight * scale) / 2 - minY * scale;

  return { x, y, scale };
};

export default function BasicTree() {
  const [direction, setDirection] = useState<(typeof directionOptions)[number]>('top-down');
  const [parentAlignment, setParentAlignment] = useState<(typeof parentAlignmentOptions)[number]>('first-child');
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [autoFit, setAutoFit] = useState(true);
  const [viewport, setViewport] = useState<Viewport>({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const layout = useLayout(nodes, {
    direction,
    nodeSize,
    gap,
    parentAlignment,
  });

  const fitCamera = useMemo(
    () => getFitCamera(layout.nodes, viewport, nodeSize),
    [layout.nodes, viewport.width, viewport.height],
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateViewport = () => {
      const rect = element.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
    };

    updateViewport();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateViewport);
      return () => window.removeEventListener('resize', updateViewport);
    }

    const observer = new ResizeObserver(updateViewport);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoFit) return;
    setCamera(fitCamera);
  }, [autoFit, fitCamera]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          Direction
          <select
            value={direction}
            onChange={(event) => setDirection(event.target.value as (typeof directionOptions)[number])}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d0d0' }}
          >
            {directionOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          Parent Alignment
          <select
            value={parentAlignment}
            onChange={(event) => setParentAlignment(event.target.value as (typeof parentAlignmentOptions)[number])}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d0d0' }}
          >
            {parentAlignmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          Camera X
          <input
            type="number"
            value={Number.isFinite(camera.x) ? camera.x : 0}
            step={10}
            disabled={autoFit}
            onChange={(event) => {
              setAutoFit(false);
              setCamera((prev) => ({ ...prev, x: Number(event.target.value) }));
            }}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d0d0', width: 120 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          Camera Y
          <input
            type="number"
            value={Number.isFinite(camera.y) ? camera.y : 0}
            step={10}
            disabled={autoFit}
            onChange={(event) => {
              setAutoFit(false);
              setCamera((prev) => ({ ...prev, y: Number(event.target.value) }));
            }}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d0d0', width: 120 }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
          Camera Scale
          <input
            type="number"
            value={Number.isFinite(camera.scale) ? camera.scale : 1}
            step={0.1}
            min={0.1}
            disabled={autoFit}
            onChange={(event) => {
              setAutoFit(false);
              setCamera((prev) => ({ ...prev, scale: Number(event.target.value) }));
            }}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #d0d0d0', width: 120 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <input
            type="checkbox"
            checked={autoFit}
            onChange={(event) => setAutoFit(event.target.checked)}
          />
          Auto Fit
        </label>
        <button
          type="button"
          onClick={() => setCamera(fitCamera)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #d0d0d0',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 12,
            height: 30,
          }}
        >
          Fit Now
        </button>
      </div>
      <div
        ref={containerRef}
        style={{ height: 520, border: '1px solid #e2e2e2', borderRadius: 12 }}
      >
        <Graph
          nodes={nodes}
          nodeSize={nodeSize}
          gap={gap}
          camera={camera}
          style={{ width: '100%', height: '100%' }}
          direction={direction}
          parentAlignment={parentAlignment}
          renderEdge={(edge: LayoutEdge) => (
            <path
              d={curvePath(edge, direction)}
              stroke="#b0b0b0"
              strokeWidth={2}
              fill="none"
            />
          )}
          renderNode={(node: LayoutNode<{ label: string }>) => (
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 10,
                border: '1px solid #c9c9c9',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                color: '#1c1c1c',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              {node.data.label}
            </div>
          )}
        />
      </div>
    </div>
  );
}
