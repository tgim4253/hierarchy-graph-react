import type { CSSProperties, ReactNode } from 'react';

type GraphRootProps = {
  x: number;
  y: number;
  scale: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function GraphRoot({ x, y, scale, children, className, style }: GraphRootProps) {
  const rootClassName = ['graph-root', className].filter(Boolean).join(' ');

  return (
    <div className={rootClassName} style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div
        className="graph-viewport"
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${x}px, ${y}px) scale(${scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
