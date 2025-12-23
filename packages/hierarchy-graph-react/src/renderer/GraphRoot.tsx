import type {
  CSSProperties,
  MouseEventHandler,
  ReactNode,
  Ref,
  WheelEventHandler,
} from 'react';

type GraphRootProps = {
  x: number;
  y: number;
  scale: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  containerRef?: Ref<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onWheel?: WheelEventHandler<HTMLDivElement>;
};

export function GraphRoot({
  x,
  y,
  scale,
  children,
  className,
  style,
  containerRef,
  onMouseDown,
  onWheel,
}: GraphRootProps) {
  const rootClassName = ['hgr-graph-root', className].filter(Boolean).join(' ');

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      onMouseDown={onMouseDown}
      onWheel={onWheel}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      <div
        className="hgr-graph-viewport"
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
