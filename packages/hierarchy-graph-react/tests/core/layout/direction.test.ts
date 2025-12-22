import { describe, expect, it } from 'vitest';
import type { LayoutNode } from '../../../src/core/types';
import { applyDirection } from '../../../src/core/layout/direction';

describe('applyDirection', () => {
  const nodes: LayoutNode<{ label: string }>[] = [
    { id: 'a', x: 10, y: 20, data: { label: 'a' }, depth: 0 },
    { id: 'b', x: -5, y: 30, data: { label: 'b' }, depth: 1, parentId: 'a' },
  ];

  it('keeps coordinates for top-down', () => {
    const result = applyDirection(nodes, 'top-down');

    expect(result).toMatchObject(nodes);
  });

  it('inverts y for bottom-up', () => {
    const result = applyDirection(nodes, 'bottom-up');

    expect(result).toMatchObject([
      { id: 'a', x: 10, y: -20, data: { label: 'a' }, depth: 0 },
      { id: 'b', x: -5, y: -30, data: { label: 'b' }, depth: 1, parentId: 'a' },
    ]);
  });

  it('swaps x and y for left-right', () => {
    const result = applyDirection(nodes, 'left-right');

    expect(result).toMatchObject([
      { id: 'a', x: 20, y: 10, data: { label: 'a' }, depth: 0 },
      { id: 'b', x: 30, y: -5, data: { label: 'b' }, depth: 1, parentId: 'a' },
    ]);
  });

  it('swaps x and y and inverts x for right-left', () => {
    const result = applyDirection(nodes, 'right-left');

    expect(result).toMatchObject([
      { id: 'a', x: -20, y: 10, data: { label: 'a' }, depth: 0 },
      { id: 'b', x: -30, y: -5, data: { label: 'b' }, depth: 1, parentId: 'a' },
    ]);
  });
});
