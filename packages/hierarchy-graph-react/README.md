# @tgim/hierarchy-graph-react

Small React helpers to lay out and render hierarchical graphs (tree-like data). You provide the UI; the library handles positions and edges.

## Install

```bash
pnpm add @tgim/hierarchy-graph-react
```

## Styles

Import the base layout CSS once in your app:

```ts
import '@tgim/hierarchy-graph-react/graph.css';
```

The base styles use `hgr-` prefixed class names to reduce collisions. If you already handle layout styles, you can skip the import and provide your own equivalents.

## Basic usage

```tsx
import { Graph, usePanZoom, type GraphNode } from '@tgim/hierarchy-graph-react';

const nodes: GraphNode<{ label: string }>[] = [
  { id: 'root', data: { label: 'Root' }, children: [{ id: 'child', data: { label: 'Child' } }] },
];

export function Example() {
  const { camera, onMouseDown, onWheel, containerRef, isPanning } = usePanZoom();

  return (
    <div ref={containerRef} onMouseDown={onMouseDown} onWheel={onWheel} style={{ height: 400 }}>
      <Graph
        nodes={nodes}
        camera={camera}
        className={isPanning ? 'hgr-is-panning' : undefined}
        renderNode={(node) => <div>{node.data.label}</div>}
      />
    </div>
  );
}
```

## Types

```ts
type Direction = 'top-down' | 'bottom-up' | 'left-right' | 'right-left';

type GraphNode<T = unknown> = {
  id: string;
  data: T;
  children?: GraphNode<T>[];
};

type GraphEdge<E = unknown> = {
  id: string;
  source: string;
  target: string;
  data?: E;
};

type LayoutNode<T = unknown> = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  data: T;
  parentId?: string;
  depth: number;
  isCluster?: boolean;
};

type LayoutEdge<E = unknown> = {
  id: string;
  sourceId: string;
  targetId: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
  data?: E;
};
```

- `GraphNode`: tree input node (use `children` to build hierarchy)
- `GraphEdge`: optional custom edge input (links `source`/`target` node ids)
- `LayoutNode`: positioned node output from layout (center-based `x`/`y`)
- `LayoutEdge`: positioned edge output with anchor points
- `Direction`: layout flow direction

## Props

### Graph

- `nodes`: `GraphNode<N>[]`
- `edges?`: `GraphEdge<E>[]`
- `onToggle?`: `(id: string) => void`
- `renderNode`: `(node: LayoutNode<N>) => ReactNode`
- `renderEdge?`: `(edge: LayoutEdge<E>) => ReactNode`
- `direction?`: `'top-down' | 'bottom-up' | 'left-right' | 'right-left'`
- `nodeSize?`: `{ width: number; height: number }`
- `gap?`: `{ level: number; sibling: number }`
- `parentAlignment?`: `'center' | 'first-child'`
- `camera?`: `{ x: number; y: number; scale: number }`
- `onCameraChange?`: `(c: { x: number; y: number; scale: number }) => void`
- `className?`: `string`
- `style?`: `CSSProperties`

When `onCameraChange` is provided, the graph root handles wheel zoom and left-drag panning.

### usePanZoom options

- `camera?`: `{ x: number; y: number; scale: number }`
- `initialCamera?`: `{ x: number; y: number; scale: number }`
- `minScale?`: `number`
- `maxScale?`: `number`
- `zoomSpeed?`: `number`
- `onCameraChange?`: `(camera: { x: number; y: number; scale: number }) => void`
