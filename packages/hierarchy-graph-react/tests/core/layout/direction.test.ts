import { describe, expect, it } from 'vitest';
import type { GraphNode, LayoutNode } from '../../../src/core/types';
import { computeSimpleTreeLayout } from '../../../src/core/layout/simpleTree';

describe('simpleTree direction', () => {
  const nodes: GraphNode<{ label: string }>[] = [
    {
      id: 'root',
      data: { label: 'root' },
      children: [{ id: 'child', data: { label: 'child' } }],
    },
  ];

  const options = {
    nodeWidth: 100,
    nodeHeight: 40,
    levelGap: 30,
    siblingGap: 20,
  };

  const toMap = <T>(layout: LayoutNode<T>[]) => new Map(layout.map(node => [node.id, node]));
  const verticalStep = options.nodeHeight + options.levelGap;
  const horizontalStep = options.nodeWidth + options.levelGap;

  it('lays out top-down positions along +y', () => {
    const layout = computeSimpleTreeLayout(nodes, { ...options, direction: 'top-down' });
    const map = toMap(layout);
    const root = map.get('root');
    const child = map.get('child');

    expect(root).toBeDefined();
    expect(child).toBeDefined();

    if (!root || !child) {
      throw new Error('Missing layout nodes.');
    }

    expect(root.y).toBe(0);
    expect(child.y).toBe(verticalStep);
    expect(root.x).toBe(child.x);
  });

  it('lays out bottom-up positions along -y', () => {
    const layout = computeSimpleTreeLayout(nodes, { ...options, direction: 'bottom-up' });
    const map = toMap(layout);
    const root = map.get('root');
    const child = map.get('child');

    expect(root).toBeDefined();
    expect(child).toBeDefined();

    if (!root || !child) {
      throw new Error('Missing layout nodes.');
    }

    expect(root.y).toBe(0);
    expect(child.y).toBe(-verticalStep);
    expect(root.x).toBe(child.x);
  });

  it('lays out left-right positions along +x', () => {
    const layout = computeSimpleTreeLayout(nodes, { ...options, direction: 'left-right' });
    const map = toMap(layout);
    const root = map.get('root');
    const child = map.get('child');

    expect(root).toBeDefined();
    expect(child).toBeDefined();

    if (!root || !child) {
      throw new Error('Missing layout nodes.');
    }

    expect(root.x).toBe(0);
    expect(child.x).toBe(horizontalStep);
    expect(root.y).toBe(child.y);
  });

  it('lays out right-left positions along -x', () => {
    const layout = computeSimpleTreeLayout(nodes, { ...options, direction: 'right-left' });
    const map = toMap(layout);
    const root = map.get('root');
    const child = map.get('child');

    expect(root).toBeDefined();
    expect(child).toBeDefined();

    if (!root || !child) {
      throw new Error('Missing layout nodes.');
    }

    expect(root.x).toBe(0);
    expect(child.x).toBe(-horizontalStep);
    expect(root.y).toBe(child.y);
  });
});
