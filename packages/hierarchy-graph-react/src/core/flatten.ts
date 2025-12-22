import type { FlatNode, GraphNode } from './types';

export function flattenTree<T>(
  nodes: GraphNode<T>[],
  parentId?: string,
  depth = 0
): FlatNode<T>[] {
  const result: FlatNode<T>[] = [];

  for (const node of nodes) {
    result.push({
      id: node.id,
      data: node.data,
      parentId,
      depth,
    });

    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, node.id, depth + 1));
    }
  }

  return result;
}
