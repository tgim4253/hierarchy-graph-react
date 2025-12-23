import { useMemo } from 'react';
import type {
  Direction,
  GraphEdge,
  GraphNode,
  LayoutEdge,
  LayoutNode,
  SimpleTreeOptions,
} from '../core/types';
import { computeSimpleTreeLayout } from '../core/layout/simpleTree';

type UseLayoutOptions<E = unknown> = {
  edges?: GraphEdge<E>[];
  direction?: Direction;
  nodeSize?: { width: number; height: number };
  gap?: { level: number; sibling: number };
  parentAlignment?: SimpleTreeOptions['parentAlignment'];
};

type LayoutResult<T, E> = {
  nodes: LayoutNode<T>[];
  edges: LayoutEdge<E>[];
};

const DEFAULT_NODE_SIZE = { width: 120, height: 48 };
const DEFAULT_GAP = { level: 80, sibling: 32 };

const getAnchorPoint = (
  node: LayoutNode<unknown>,
  nodeSize: { width: number; height: number },
  direction: Direction,
  role: 'source' | 'target',
) => {
  const width = node.width ?? nodeSize.width;
  const height = node.height ?? nodeSize.height;
  const halfWidth = width / 2;
  const halfHeight = height / 2;

  switch (direction) {
    case 'bottom-up':
      return role === 'source'
        ? { x: node.x, y: node.y - halfHeight }
        : { x: node.x, y: node.y + halfHeight };
    case 'left-right':
      return role === 'source'
        ? { x: node.x + halfWidth, y: node.y }
        : { x: node.x - halfWidth, y: node.y };
    case 'right-left':
      return role === 'source'
        ? { x: node.x - halfWidth, y: node.y }
        : { x: node.x + halfWidth, y: node.y };
    case 'top-down':
    default:
      return role === 'source'
        ? { x: node.x, y: node.y + halfHeight }
        : { x: node.x, y: node.y - halfHeight };
  }
};

export function useLayout<T, E = unknown>(
  nodes: GraphNode<T>[],
  options: UseLayoutOptions<E> = {},
): LayoutResult<T, E> {
  const {
    edges,
    direction = 'top-down',
    nodeSize = DEFAULT_NODE_SIZE,
    gap = DEFAULT_GAP,
    parentAlignment,
  } = options;

  return useMemo(() => {
    const layoutNodes = computeSimpleTreeLayout(nodes, {
      nodeWidth: nodeSize.width,
      nodeHeight: nodeSize.height,
      levelGap: gap.level,
      siblingGap: gap.sibling,
      parentAlignment,
      direction,
    });

    const finalNodes = layoutNodes;

    const nodeMap = new Map(finalNodes.map(node => [node.id, node]));
    const layoutEdges: LayoutEdge<E>[] = [];

    if (edges && edges.length > 0) {
      for (const edge of edges) {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) continue;

        layoutEdges.push({
          id: edge.id,
          sourceId: edge.source,
          targetId: edge.target,
          source: getAnchorPoint(sourceNode, nodeSize, direction, 'source'),
          target: getAnchorPoint(targetNode, nodeSize, direction, 'target'),
          data: edge.data,
        });
      }
    } else {
      for (const node of finalNodes) {
        if (!node.parentId) continue;
        const parent = nodeMap.get(node.parentId);
        if (!parent) continue;

        layoutEdges.push({
          id: `${parent.id}->${node.id}`,
          sourceId: parent.id,
          targetId: node.id,
          source: getAnchorPoint(parent, nodeSize, direction, 'source'),
          target: getAnchorPoint(node, nodeSize, direction, 'target'),
        });
      }
    }

    return { nodes: finalNodes, edges: layoutEdges };
  }, [
    nodes,
    edges,
    direction,
    nodeSize.width,
    nodeSize.height,
    gap.level,
    gap.sibling,
    parentAlignment,
  ]);
}
