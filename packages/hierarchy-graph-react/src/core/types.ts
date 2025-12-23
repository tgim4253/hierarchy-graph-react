import type { CSSProperties, ReactNode } from 'react';

export type GraphNode<T = unknown> = {
  id: string;
  data: T;
  children?: GraphNode<T>[];
};

export type SimpleTreeOptions = {
  nodeWidth: number;
  nodeHeight: number;
  levelGap: number;
  siblingGap: number;
  parentAlignment?: 'center' | 'first-child';
  direction?: Direction;
  isHorizontal?: boolean;
};

export type FlatNode<T = unknown> = {
  id: string;
  data: T;
  parentId?: string;
  depth: number;
};

export type GraphEdge<E = unknown> = {
  id: string;
  source: string;
  target: string;
  data?: E;
};

export type LayoutNode<T = unknown> = {
  id: string;
  x: number; // center
  y: number; // center
  width?: number;
  height?: number;
  data: T;
  parentId?: string;
  depth: number;
  isCluster?: boolean;
};

export type LayoutEdge<E = unknown> = {
  id: string;
  sourceId: string;
  targetId: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
  data?: E;
};

export type GraphProps<N = unknown, E = unknown> = {
  nodes: GraphNode<N>[];
  edges?: GraphEdge<E>[];
  renderNode: (node: LayoutNode<N>) => ReactNode;
  renderEdge?: (edge: LayoutEdge<E>) => ReactNode;
  direction?: Direction;
  nodeSize?: { width: number; height: number };
  gap?: { level: number; sibling: number };
  parentAlignment?: SimpleTreeOptions['parentAlignment'];
  camera?: {
    x: number;
    y: number;
    scale: number;
  };
  onCameraChange?: (c: { x: number; y: number; scale: number }) => void;
  className?: string;
  style?: CSSProperties;
};

export type Direction = 'top-down' | 'bottom-up' | 'left-right' | 'right-left';
