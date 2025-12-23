import type { Direction, LayoutEdge } from './types';

const prefersHorizontal = (direction: Direction | undefined, dx: number, dy: number) =>
  direction
    ? direction === 'left-right' || direction === 'right-left'
    : Math.abs(dx) >= Math.abs(dy);

export function straightPath(edge: LayoutEdge, _direction?: Direction): string {
  const { source, target } = edge;
  return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
}

export type CurvePathOptions = {
  direction?: Direction;
  straightRatio?: number;
};

export function curvePath(
  edge: LayoutEdge,
  directionOrOptions?: Direction | CurvePathOptions,
  options?: CurvePathOptions,
): string {
  const direction =
    typeof directionOrOptions === 'object' ? directionOrOptions?.direction : directionOrOptions;
  const straightRatio =
    (typeof directionOrOptions === 'object' ? directionOrOptions?.straightRatio : options?.straightRatio) ??
    0.3;
  const { source, target } = edge;
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  if (prefersHorizontal(direction, dx, dy)) {
    const bendX = source.x + dx * straightRatio;
    const controlX = bendX + (target.x - bendX) / 2;
    return `M ${source.x} ${source.y} L ${bendX} ${source.y} C ${controlX} ${source.y} ${controlX} ${target.y} ${target.x} ${target.y}`;
  }

  const bendY = source.y + dy * straightRatio;
  const controlY = bendY + (target.y - bendY) / 2;
  return `M ${source.x} ${source.y} L ${source.x} ${bendY} C ${source.x} ${controlY} ${target.x} ${controlY} ${target.x} ${target.y}`;
}

export function elbowPath(edge: LayoutEdge, direction?: Direction): string {
  const { source, target } = edge;
  const dx = target.x - source.x;
  const dy = target.y - source.y;

  if (prefersHorizontal(direction, dx, dy)) {
    const midX = (source.x + target.x) / 2;
    return `M ${source.x} ${source.y} L ${midX} ${source.y} L ${midX} ${target.y} L ${target.x} ${target.y}`;
  }

  const midY = (source.y + target.y) / 2;
  return `M ${source.x} ${source.y} L ${source.x} ${midY} L ${target.x} ${midY} L ${target.x} ${target.y}`;
}
