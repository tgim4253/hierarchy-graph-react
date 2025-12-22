import { describe, expect, it } from 'vitest';
import type { LayoutEdge } from '../../src/core/types';
import { curvePath, elbowPath, straightPath } from '../../src/core/edgePath';

describe('edgePath', () => {
  const edge: LayoutEdge = {
    id: 'e1',
    sourceId: 'a',
    targetId: 'b',
    source: { x: 0, y: 0 },
    target: { x: 40, y: 20 },
  };

  it('builds a straight path from source to target', () => {
    expect(straightPath(edge)).toBe('M 0 0 L 40 20');
  });

  it('builds a smooth curve path from source to target', () => {
    expect(curvePath(edge)).toBe('M 0 0 C 0 10 40 10 40 20');
  });

  it('builds an elbow path from source to target', () => {
    expect(elbowPath(edge)).toBe('M 0 0 L 0 10 L 40 10 L 40 20');
  });
});
