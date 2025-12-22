import type { CSSProperties, ReactNode } from 'react';
import type { LayoutEdge } from '../core/types';
import { straightPath } from '../core/edgePath';

type SvgEdgesProps<E> = {
  edges: LayoutEdge<E>[];
  pathBuilder?: (edge: LayoutEdge<E>) => string;
  renderEdge?: (edge: LayoutEdge<E>) => ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function SvgEdges<E>({
  edges,
  pathBuilder = straightPath,
  renderEdge,
  className,
  style,
}: SvgEdgesProps<E>) {
  const edgesClassName = ['graph-edges', className].filter(Boolean).join(' ');

  return (
    <svg
      className={edgesClassName}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        ...style,
      }}
    >
      {edges.map(edge =>
        renderEdge ? (
          <g key={edge.id}>{renderEdge(edge)}</g>
        ) : (
          <path key={edge.id} d={pathBuilder(edge)} />
        ),
      )}
    </svg>
  );
}
