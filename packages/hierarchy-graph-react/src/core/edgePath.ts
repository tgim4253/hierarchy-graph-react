import type { LayoutEdge } from './types';

export function straightPath(edge: LayoutEdge): string {
  const { source, target } = edge;
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

export function curvePath(edge: LayoutEdge): string {
  const { source, target } = edge;
  const midY = (source.y + target.y) / 2;
  return `M ${source.x} ${source.y} C ${source.x} ${midY} ${target.x} ${midY} ${target.x} ${target.y}`;
}

export function elbowPath(edge: LayoutEdge): string {
  const { source, target } = edge;
  const midY = (source.y + target.y) / 2;
  return `M ${source.x} ${source.y} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${target.y}`;
}
