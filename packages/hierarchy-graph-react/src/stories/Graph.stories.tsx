import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef, useState } from 'react';
import type { Direction, GraphNode, LayoutEdge, LayoutNode } from '../core/types';
import { curvePath, Graph, useLayout } from '../index';

type NodeData = { label: string };

const nodes: GraphNode<NodeData>[] = [
  {
    id: 'root',
    data: { label: 'Root' },
    children: [
      {
        id: 'left',
        data: { label: 'Left' },
        children: [
          { id: 'left-child', data: { label: 'Left Child' } },
          { id: 'left-child-2', data: { label: 'Left Child 2' } },
        ],
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

const asymNodes: GraphNode<NodeData>[] = [
  {
    id: 'root',
    data: { label: 'Root' },
    children: [
      {
        id: 'left',
        data: { label: 'Left' },
        children: [
          { id: 'left-1', data: { label: 'Left 1' } },
          {
            id: 'left-2',
            data: { label: 'Left 2' },
            children: [{ id: 'left-2-1', data: { label: 'Left 2-1' } }],
          },
        ],
      },
      {
        id: 'right',
        data: { label: 'Right' },
        children: [{ id: 'right-1', data: { label: 'Right 1' } }],
      },
    ],
  },
  {
    id: 'solo',
    data: { label: 'Solo Root' },
    children: [
      { id: 'solo-1', data: { label: 'Solo 1' } },
      {
        id: 'solo-2',
        data: { label: 'Solo 2' },
        children: [
          { id: 'solo-2-1', data: { label: 'Solo 2-1' } },
          { id: 'solo-2-2', data: { label: 'Solo 2-2' } },
          { id: 'solo-2-3', data: { label: 'Solo 2-3' } },
        ],
      },
    ],
  },
];

const meta: Meta<typeof Graph> = {
  title: 'Hierarchy Graph/Graph',
  component: Graph,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['top-down', 'bottom-up', 'left-right', 'right-left'],
    },
    parentAlignment: {
      control: 'select',
      options: ['first-child', 'center'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Graph>;

const Canvas = ({
  children,
  containerRef,
}: {
  children: React.ReactNode;
  containerRef?: React.Ref<HTMLDivElement>;
}) => (
  <div
    ref={containerRef}
    style={{ height: 520, borderRadius: 12, border: '1px solid #e2e2e2' }}
  >
    {children}
  </div>
);

const DEFAULT_NODE_SIZE = { width: 120, height: 48 };
const DEFAULT_GAP = { level: 80, sibling: 40 };
const CAMERA_PADDING = 32;

const getFitCamera = (
  layoutNodes: ReturnType<typeof useLayout>['nodes'],
  viewport: { width: number; height: number },
  fallbackSize: { width: number; height: number },
  padding = CAMERA_PADDING,
) => {
  if (layoutNodes.length === 0 || viewport.width === 0 || viewport.height === 0) {
    return { x: 0, y: 0, scale: 1 };
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
    return { x: 0, y: 0, scale: 1 };
  }

  const x = (viewport.width - boundsWidth * scale) / 2 - minX * scale;
  const y = (viewport.height - boundsHeight * scale) / 2 - minY * scale;

  return { x, y, scale };
};

const GraphWithCamera = ({
  args,
  nodes,
  renderEdge,
  renderNode,
}: {
  args: Story['args'];
  nodes: GraphNode<NodeData>[];
  renderEdge: (edge: LayoutEdge) => React.ReactNode;
  renderNode: (node: LayoutNode<NodeData>) => React.ReactNode;
}) => {
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [hasFit, setHasFit] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);

  const nodeSize = args?.nodeSize ?? DEFAULT_NODE_SIZE;
  const gap = args?.gap ?? DEFAULT_GAP;
  const direction = args?.direction;
  const parentAlignment = args?.parentAlignment;

  const layout = useLayout(nodes, {
    direction,
    nodeSize,
    gap,
    parentAlignment,
  });

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
    setHasFit(false);
  }, [
    nodes,
    direction,
    parentAlignment,
    nodeSize.width,
    nodeSize.height,
    gap.level,
    gap.sibling,
  ]);

  useEffect(() => {
    if (hasFit) return;
    if (viewport.width === 0 || viewport.height === 0) return;
    if (layout.nodes.length === 0) return;

    setCamera(getFitCamera(layout.nodes, viewport, nodeSize));
    setHasFit(true);
  }, [hasFit, layout.nodes, nodeSize, viewport]);

  return (
    <Canvas containerRef={containerRef}>
      <Graph
        {...args}
        nodes={nodes}
        camera={camera}
        onCameraChange={setCamera}
        style={{ width: '100%', height: '100%' }}
        renderEdge={renderEdge}
        renderNode={renderNode}
      />
    </Canvas>
  );
};

export const Basic: Story = {
  args: {
    direction: 'top-down',
    parentAlignment: 'first-child',
    nodeSize: { width: 120, height: 48 },
    gap: { level: 80, sibling: 40 },
  },
  render: (args) => (
    <GraphWithCamera
      args={args}
      nodes={nodes}
      renderEdge={(edge) => (
        <path d={curvePath(edge, args.direction)} stroke="#b0b0b0" strokeWidth={2} fill="none" />
      )}
      renderNode={(node) => (
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
  ),
};

export const Asymmetric: Story = {
  args: {
    direction: 'left-right' as Direction,
    parentAlignment: 'center' as const,
    nodeSize: { width: 120, height: 48 },
    gap: { level: 80, sibling: 40 },
  },
  render: (args) => (
    <GraphWithCamera
      args={args}
      nodes={asymNodes}
      renderEdge={(edge) => (
        <path
          d={curvePath(edge, { direction: args.direction, straightRatio: 0.45 })}
          stroke="#b0b0b0"
          strokeWidth={2}
          fill="none"
        />
      )}
      renderNode={(node) => (
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
  ),
};

export const CustomEdge: Story = {
  args: {
    direction: 'top-down' as Direction,
    parentAlignment: 'first-child' as const,
    nodeSize: { width: 120, height: 48 },
    gap: { level: 80, sibling: 40 },
  },
  render: (args) => (
    <GraphWithCamera
      args={args}
      nodes={nodes}
      renderEdge={(edge) => (
        <g>
          <path
            d={`M ${edge.source.x} ${edge.source.y} L ${edge.target.x} ${edge.target.y}`}
            stroke="#4a7"
            strokeWidth={2}
            strokeDasharray="6 6"
            fill="none"
          />
          <circle cx={edge.source.x} cy={edge.source.y} r={4} fill="#4a7" />
          <circle cx={edge.target.x} cy={edge.target.y} r={4} fill="#4a7" />
        </g>
      )}
      renderNode={(node) => (
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
  ),
};

const directions: Direction[] = ['top-down', 'bottom-up', 'left-right', 'right-left'];

export const Directions: Story = {
  args: {
    parentAlignment: 'first-child' as const,
    nodeSize: { width: 120, height: 48 },
    gap: { level: 80, sibling: 40 },
  },
  render: (args) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 16,
      }}
    >
      {directions.map((direction) => (
        <div key={direction}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{direction}</div>
          <GraphWithCamera
            args={{ ...args, direction }}
            nodes={nodes}
            renderEdge={(edge) => (
              <path
                d={curvePath(edge, direction)}
                stroke="#b0b0b0"
                strokeWidth={2}
                fill="none"
              />
            )}
            renderNode={(node) => (
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
      ))}
    </div>
  ),
};
