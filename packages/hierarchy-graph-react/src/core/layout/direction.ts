import type { Direction, LayoutNode } from '../types';

export function applyDirection<T>(
  nodes: LayoutNode<T>[],
  direction: Direction
): LayoutNode<T>[] {
  switch (direction) {
    case 'bottom-up':
      return nodes.map(node => ({
        ...node,
        y: -node.y,
      }));
    case 'left-right':
      return nodes.map(node => ({
        ...node,
        x: node.y,
        y: node.x,
      }));
    case 'right-left':
      return nodes.map(node => ({
        ...node,
        x: -node.y,
        y: node.x,
      }));
    case 'top-down':
    default:
      return nodes.map(node => ({ ...node }));
  }
}
