import type { GraphProps } from '../core/types';
import { useLayout } from '../hooks/useLayout';
import { GraphRoot } from '../renderer/GraphRoot';
import { NodeLayer } from '../renderer/NodeLayer';
import { SvgEdges } from '../renderer/SvgEdges';

const DEFAULT_CAMERA = { x: 0, y: 0, scale: 1 };

export function Graph<N, E = unknown>({
  nodes,
  edges,
  renderNode,
  renderEdge,
  direction,
  nodeSize,
  gap,
  camera,
  className,
  style,
  parentAlignment,
}: GraphProps<N, E>) {
  const layout = useLayout(nodes, {
    edges,
    direction,
    nodeSize,
    gap,
    parentAlignment,
  });

  const view = camera ?? DEFAULT_CAMERA;

  return (
    <GraphRoot x={view.x} y={view.y} scale={view.scale} className={className} style={style}>
      <SvgEdges edges={layout.edges} renderEdge={renderEdge} />
      <NodeLayer nodes={layout.nodes} renderNode={renderNode} />
    </GraphRoot>
  );
}
