import { describe, expect, it } from 'vitest';
import type { GraphNode } from '../../src/core/types';
import { flattenTree } from '../../src/core/flatten';

describe('flattenTree', () => {
  it('flattens a tree using depth-first pre-order with depth and parentId', () => {
    const nodes: GraphNode<{ label: string }>[] = [
      {
        id: 'a',
        data: { label: 'a' },
        children: [
          { id: 'b', data: { label: 'b' } },
          {
            id: 'c',
            data: { label: 'c' },
            children: [{ id: 'd', data: { label: 'd' } }],
          },
        ],
      },
      { id: 'e', data: { label: 'e' } },
    ];

    const result = flattenTree(nodes);

    expect(result.map(node => node.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(result).toMatchObject([
      { id: 'a', data: { label: 'a' }, depth: 0 },
      { id: 'b', data: { label: 'b' }, parentId: 'a', depth: 1 },
      { id: 'c', data: { label: 'c' }, parentId: 'a', depth: 1 },
      { id: 'd', data: { label: 'd' }, parentId: 'c', depth: 2 },
      { id: 'e', data: { label: 'e' }, depth: 0 },
    ]);
    expect(result[0].parentId).toBeUndefined();
    expect(result[4].parentId).toBeUndefined();
  });

  it('respects the provided parentId and depth', () => {
    const nodes: GraphNode<{ label: string }>[] = [{ id: 'child', data: { label: 'child' } }];

    const result = flattenTree(nodes, 'root', 2);

    expect(result).toMatchObject([
      { id: 'child', parentId: 'root', depth: 2, data: { label: 'child' } },
    ]);
  });
});
