import type { CSSProperties, ReactNode } from 'react';
import type { LayoutNode } from '../core/types';

type NodeLayerProps<T> = {
  nodes: LayoutNode<T>[];
  renderNode: (node: LayoutNode<T>) => ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function NodeLayer<T>({ nodes, renderNode, className, style }: NodeLayerProps<T>) {
  const layerClassName = ['hgr-graph-node-layer', className].filter(Boolean).join(' ');

  return (
    <div className={layerClassName} style={{ position: 'absolute', inset: 0, ...style }}>
      {nodes.map(node => (
        <div
          key={node.id}
          className="hgr-graph-node"
          style={{
            position: 'absolute',
            width: node.width,
            height: node.height,
            transform: `translate(${node.x - (node.width ?? 0) / 2}px, ${
              node.y - (node.height ?? 0) / 2
            }px)`,
          }}
        >
  {renderNode(node)}
</div>
      ))}
    </div>
  );
}
