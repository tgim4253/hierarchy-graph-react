import type { Direction, GraphNode, LayoutNode, SimpleTreeOptions } from '../types';

export function buildSubtreeWidthMap<T>(
  nodes: GraphNode<T>[],
  options: Pick<SimpleTreeOptions, 'nodeWidth' | 'siblingGap'>,
): Map<string, number> {
  const { nodeWidth, siblingGap } = options;
  const widthMap = new Map<string, number>();

  const computeSubtreeWidth = (node: GraphNode<T>): number => {
    const children = node.children ?? [];

    if (children.length === 0) {
      widthMap.set(node.id, nodeWidth);
      return nodeWidth;
    }

    let childrenWidth = 0;
    for (const child of children) {
      childrenWidth += computeSubtreeWidth(child);
    }

    if (children.length > 1) {
      childrenWidth += siblingGap * (children.length - 1);
    }

    const width = Math.max(nodeWidth, childrenWidth);
    widthMap.set(node.id, width);
    return width;
  };

  for (const node of nodes) {
    computeSubtreeWidth(node);
  }

  return widthMap;
}

export function computeSimpleTreeLayout<T>(
  nodes: GraphNode<T>[],
  options: SimpleTreeOptions,
): LayoutNode<T>[] {
  if (nodes.length === 0) return [];

  const { nodeWidth, nodeHeight, levelGap, siblingGap } = options;
  const parentAlignment = options.parentAlignment ?? 'center';
  const direction: Direction =
    options.direction ?? (options.isHorizontal ? 'left-right' : 'top-down');
  const isHorizontal = direction === 'left-right' || direction === 'right-left';
  const breadthSize = isHorizontal ? nodeHeight : nodeWidth;
  const depthSize = isHorizontal ? nodeWidth : nodeHeight;
  const depthStep = depthSize + levelGap;
  const depthSign = direction === 'bottom-up' || direction === 'right-left' ? -1 : 1;
  const widthMap = buildSubtreeWidthMap(nodes, { nodeWidth: breadthSize, siblingGap });

  const layoutNodes: LayoutNode<T>[] = [];

  // assign x/y positions and parent linkage.
  const assignPositions = (node: GraphNode<T>, left: number, depth: number, parentId?: string) => {
    const width = widthMap.get(node.id) ?? breadthSize;
    const children = node.children ?? [];
    const childrenWidth =
      children.length === 0
        ? 0
        : children.reduce((sum, child) => sum + (widthMap.get(child.id) ?? breadthSize), 0) +
          siblingGap * (children.length - 1);

    const depthPos = depth * depthStep * depthSign;
    const centerPos = left + width / 2;

    let breadthPos = centerPos;

    if (parentAlignment === 'first-child' && children.length > 0) {
      const firstChildLeft = left + (width - childrenWidth) / 2;
      const firstChildCenter = firstChildLeft + breadthSize / 2;
      breadthPos = firstChildCenter;
    }

    const x = isHorizontal ? depthPos : breadthPos;
    const y = isHorizontal ? breadthPos : depthPos;

    layoutNodes.push({
      id: node.id,
      x,
      y,
      width: nodeWidth,
      height: nodeHeight,
      data: node.data,
      parentId,
      depth,
    });

    if (children.length === 0) return;

    let currentLeft = left + (width - childrenWidth) / 2;

    for (const child of children) {
      assignPositions(child, currentLeft, depth + 1, node.id);
      currentLeft += (widthMap.get(child.id) ?? breadthSize) + siblingGap;
    }
  };

  let currentLeft = 0;
  for (const node of nodes) {
    assignPositions(node, currentLeft, 0);
    currentLeft += (widthMap.get(node.id) ?? breadthSize) + siblingGap;
  }

  const firstRoot = layoutNodes.find(node => node.id === nodes[0].id);
  if (!firstRoot) return layoutNodes;

  // Normalize so the first root sits at 0 along the breadth axis for stable output.
  const shiftX = isHorizontal ? 0 : -firstRoot.x;
  const shiftY = isHorizontal ? -firstRoot.y : 0;
  if (shiftX === 0 && shiftY === 0) return layoutNodes;

  return layoutNodes.map(node => ({
    ...node,
    x: node.x + shiftX,
    y: node.y + shiftY,
  }));
}
