import type { GraphProps } from '../core/types';
import { useLayout } from '../hooks/useLayout';
import { usePanZoom } from '../hooks/usePanZoom';
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
  onCameraChange,
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

  const panZoom = usePanZoom({ camera, onCameraChange });
  const enablePanZoom = Boolean(onCameraChange);
  const view = enablePanZoom ? panZoom.camera : camera ?? DEFAULT_CAMERA;
  const rootClassName = [className, enablePanZoom && panZoom.isPanning ? 'hgr-is-panning' : undefined]
    .filter(Boolean)
    .join(' ');

  return (
    <GraphRoot
      x={view.x}
      y={view.y}
      scale={view.scale}
      className={rootClassName}
      style={style}
      containerRef={enablePanZoom ? panZoom.containerRef : undefined}
      onMouseDown={enablePanZoom ? panZoom.onMouseDown : undefined}
      onWheel={enablePanZoom ? panZoom.onWheel : undefined}
    >
      <SvgEdges edges={layout.edges} renderEdge={renderEdge} />
      <NodeLayer nodes={layout.nodes} renderNode={renderNode} />
    </GraphRoot>
  );
}
