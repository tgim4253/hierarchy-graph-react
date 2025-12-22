import { describe, expect, it } from 'vitest';
import type { GraphNode, LayoutNode } from '../../../src/core/types';
import { computeSimpleTreeLayout } from '../../../src/core/layout/simpleTree';

describe('simpleTree layout', () => {
  const options = {
    nodeWidth: 100,
    nodeHeight: 40,
    levelGap: 30,
    siblingGap: 20,
  };

  const toMap = <T>(nodes: LayoutNode<T>[]) => new Map(nodes.map(node => [node.id, node]));

  it('lays out a single node at depth 0', () => {
    const nodes: GraphNode<{ label: string }>[] = [{ id: 'root', data: { label: 'root' } }];

    const layout = computeSimpleTreeLayout(nodes, options);

    expect(layout).toHaveLength(1);
    expect(layout[0]).toMatchObject({
      id: 'root',
      depth: 0,
      x: 0,
      y: 0,
      data: { label: 'root' },
    });
  });

  it('keeps x aligned on a one-sided tree and increases y by level', () => {
    const nodes: GraphNode<{ label: string }>[] = [
      {
        id: 'a',
        data: { label: 'a' },
        children: [
          {
            id: 'b',
            data: { label: 'b' },
            children: [{ id: 'c', data: { label: 'c' } }],
          },
        ],
      },
    ];

    const layout = computeSimpleTreeLayout(nodes, options);
    const map = toMap(layout);
    const levelStep = options.nodeHeight + options.levelGap;
    const a = map.get('a');
    const b = map.get('b');
    const c = map.get('c');

    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(c).toBeDefined();

    if (!a || !b || !c) {
      throw new Error('Missing layout nodes.');
    }

    expect(a.x).toBe(b.x);
    expect(b.x).toBe(c.x);
    expect(b.y - a.y).toBe(levelStep);
    expect(c.y - b.y).toBe(levelStep);
  });

  it('respects siblingGap and centers parents over children', () => {
    const nodes: GraphNode<{ label: string }>[] = [
      {
        id: 'root',
        data: { label: 'root' },
        children: [
          { id: 'left', data: { label: 'left' } },
          { id: 'middle', data: { label: 'middle' } },
          { id: 'right', data: { label: 'right' } },
        ],
      },
    ];

    const layout = computeSimpleTreeLayout(nodes, options);
    const map = toMap(layout);
    const root = map.get('root');
    const left = map.get('left');
    const middle = map.get('middle');
    const right = map.get('right');

    expect(root).toBeDefined();
    expect(left).toBeDefined();
    expect(middle).toBeDefined();
    expect(right).toBeDefined();

    if (!root || !left || !middle || !right) {
      throw new Error('Missing layout nodes.');
    }

    const expectedGap = options.nodeWidth + options.siblingGap;

    expect(left.x).toBeLessThan(middle.x);
    expect(middle.x).toBeLessThan(right.x);
    expect(middle.x - left.x).toBe(expectedGap);
    expect(right.x - middle.x).toBe(expectedGap);
    expect(root.x).toBe((left.x + right.x) / 2);

    const levelStep = options.nodeHeight + options.levelGap;
    expect(left.y - root.y).toBe(levelStep);
    expect(middle.y - root.y).toBe(levelStep);
    expect(right.y - root.y).toBe(levelStep);
  });

  it('aligns parent with the first child when parentAlignment is first-child', () => {
    const nodes: GraphNode<{ label: string }>[] = [
      {
        id: 'root',
        data: { label: 'root' },
        children: [
          { id: 'left', data: { label: 'left' } },
          { id: 'right', data: { label: 'right' } },
        ],
      },
    ];

    const layout = computeSimpleTreeLayout(nodes, {
      ...options,
      parentAlignment: 'first-child',
    });
    const map = toMap(layout);
    const root = map.get('root');
    const left = map.get('left');
    const right = map.get('right');

    expect(root).toBeDefined();
    expect(left).toBeDefined();
    expect(right).toBeDefined();

    if (!root || !left || !right) {
      throw new Error('Missing layout nodes.');
    }

    expect(left.x).toBeLessThan(right.x);
    expect(root.x).toBe(left.x);
  });

  it('preserves input order when determining left-to-right positions', () => {
    const nodes: GraphNode<{ label: string }>[] = [
      {
        id: 'root',
        data: { label: 'root' },
        children: [
          {
            id: 'first',
            data: { label: 'first' },
            children: [{ id: 'first-child', data: { label: 'first-child' } }],
          },
          {
            id: 'second',
            data: { label: 'second' },
            children: [{ id: 'second-child', data: { label: 'second-child' } }],
          },
        ],
      },
    ];

    const layout = computeSimpleTreeLayout(nodes, options);
    const map = toMap(layout);
    const first = map.get('first');
    const second = map.get('second');
    const firstChild = map.get('first-child');
    const secondChild = map.get('second-child');

    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(firstChild).toBeDefined();
    expect(secondChild).toBeDefined();

    if (!first || !second || !firstChild || !secondChild) {
      throw new Error('Missing layout nodes.');
    }

    expect(first.x).toBeLessThan(second.x);
    expect(firstChild.x).toBe(first.x);
    expect(secondChild.x).toBe(second.x);
  });
});
